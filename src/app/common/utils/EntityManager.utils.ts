// entity-manager.util.ts
import { EntityTarget, QueryRunner } from "typeorm";

export class EntityManagerUtil<T, U> {
  constructor(
    private queryRunner: QueryRunner,
    private entity: EntityTarget<T>,
    private checkExistence: (criteria: Partial<U>) => Promise<boolean>
  ) {}

  // General method to process items for delete, update, and add operations
  async processEntities(
    items: U[],
    options: {
      getDeleteCondition: (item: U) => boolean;
      getUpdateCondition: (item: U) => boolean;
      createEntity: (item: U) => T;
      updateEntityFields: (item: U) => Partial<T>;
      parentIdField?: keyof T;
      parentId?: string;
    }
  ) {
    const deleteItems = items.filter(options.getDeleteCondition);
    const updateItems = items.filter(options.getUpdateCondition);
    const newItems = items.filter(
      (item) =>
        !options.getDeleteCondition(item) && !options.getUpdateCondition(item)
    );

    await Promise.all([
      this.deleteEntities(deleteItems),
      this.updateEntities(
        updateItems,
        options.updateEntityFields,
        options.parentIdField,
        options.parentId
      ),
      this.addNewEntities(newItems, options.createEntity),
    ]);
  }

  // Delete entities based on specified items
  private async deleteEntities(deleteItems: U[]) {
    if (!deleteItems.length) return;
    await Promise.all(
      deleteItems.map(async (item) => {
        const exists = await this.checkExistence({
          id: (item as any).id,
        } as any);
        if (exists)
          await this.queryRunner.manager.delete(this.entity, {
            id: (item as any).id,
          });
      })
    );
  }

  // Update entities based on specified items and fields
  private async updateEntities(
    updateItems: U[],
    updateEntityFields: (item: U) => Partial<T>,
    parentIdField?: keyof T,
    parentId?: string
  ) {
    if (!updateItems.length) return;
    await Promise.all(
      updateItems.map(async (item) => {
        const exists = await this.checkExistence({
          id: (item as any).id,
        } as any);
        if (exists) {
          const updateData: any = {
            ...updateEntityFields(item),
            ...(parentIdField && parentId ? { [parentIdField]: parentId } : {}),
          };
          await this.queryRunner.manager.update(
            this.entity,
            { id: (item as any).id },
            updateData
          );
        }
      })
    );
  }

  // Add new entities based on specified items
  private async addNewEntities(newItems: U[], createEntity: (item: U) => T) {
    if (!newItems.length) return;
    await Promise.all(
      newItems.map(async (item) => {
        const entityInstance = createEntity(item);
        await this.queryRunner.manager.save(entityInstance);
      })
    );
  }
}
