import { Database, Migration } from '../../../src';
import { CollectionName } from '../enums/collection-name.enum';

export class Migration1740260291950 implements Migration {
  async up(database: Database): Promise<void> {
    await database.createEdgeCollection(CollectionName.Knows);
  }

  async down(database: Database): Promise<void> {
    await database.collection(CollectionName.Knows).drop();
  }
}
