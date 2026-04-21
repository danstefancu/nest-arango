import { Injectable } from '@nestjs/common';
import { aql } from 'arangojs';
import { Document } from 'arangojs/documents';
import {
  ArangoEdgeRepository,
  ArangoManager,
  ArangoNewOldResult,
  ArangoRepository,
  InjectManager,
  InjectRepository,
  SortDirection,
} from '../../../src';
import { KnowsEntity } from '../entities/knows.entity';
import { PersonEntity } from '../entities/person.entity';
import { CollectionName } from '../enums/collection-name.enum';

@Injectable()
export class TestService {
  constructor(
    @InjectManager()
    private readonly databaseManager: ArangoManager,
    @InjectRepository(PersonEntity)
    private readonly personRepository: ArangoRepository<PersonEntity>,
    @InjectRepository(KnowsEntity)
    private readonly knowsRepository: ArangoEdgeRepository<KnowsEntity>,
  ) {}

  async truncateCollections() {
    await this.personRepository.truncate();
    await this.knowsRepository.truncate();
  }

  async saveAll(options: { emitEvents: boolean }) {
    return await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
      })),
      { emitEvents: options.emitEvents },
    );
  }

  async saveOne(options: { emitEvents: boolean }) {
    return await this.personRepository.save(
      {
        name: 'testname123',
      },
      { emitEvents: options.emitEvents, data: { order: 0 } },
    );
  }

  async documentExists() {
    const person = await this.personRepository.save(
      {
        name: 'testname123',
      },
      { emitEvents: false },
    );

    return await this.personRepository.documentExists(person!._key);
  }

  async findOne() {
    const person = await this.personRepository.save(
      {
        name: 'testname123',
      },
      { emitEvents: false },
    );

    return await this.personRepository.findOne(person!._key);
  }

  async findOneNull() {
    return await this.personRepository.findOne('invalid_key_1235448949196');
  }

  async findOneBy() {
    await this.personRepository.save(
      {
        name: 'testname123',
      },
      { emitEvents: false },
    );

    return await this.personRepository.findOneBy({
      name: 'testname123',
    });
  }

  async findOneByNull() {
    return await this.personRepository.findOneBy({
      _key: 'invalid_key_1235448949196',
    });
  }

  async documentsExistKeys() {
    const entries = await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
      })),
      { emitEvents: false, returnFailures: false },
    );

    return await this.personRepository.documentsExist(
      entries.map((entry) => entry._key),
    );
  }

  async documentsExistIds() {
    const entries = await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
      })),
      { emitEvents: false, returnFailures: false },
    );

    return await this.personRepository.documentsExist(
      entries.map((entry) => entry._id),
    );
  }

  async documentsExistEntities() {
    const entries = await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
      })),
      { emitEvents: false, returnFailures: false },
    );

    return await this.personRepository.documentsExist(entries);
  }

  async findMany() {
    const entries = await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
      })),
      { emitEvents: false, returnFailures: false },
    );

    return await this.personRepository.findMany(
      entries.map((entry) => entry._key),
    );
  }

  async findManyEmpty() {
    return await this.personRepository.findMany(
      Array.from(new Array(5), (_val, index) => `invalid_key_${index}`),
    );
  }

  async findManyBy() {
    await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `Common Name`,
        email: `email${index}@test.com`,
      })),
      { emitEvents: false },
    );

    return await this.personRepository.findManyBy({
      name: 'Common Name',
    });
  }

  async findManyByEmpty() {
    return await this.personRepository.findManyBy({
      name: `Fake Name`,
    });
  }

  async findAll(entriesToCreateCount: number, pageSize: number) {
    await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(entriesToCreateCount), (_val, index) => ({
        name: `test${index}`,
      })),
      { emitEvents: false },
    );
    const findAll = await this.personRepository.findAll({
      pageSize: pageSize,
      page: 0,
    });

    return findAll;
  }

  async getDocumentCountBy() {
    await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `Common Name`,
        email: `email${index}@test.com`,
      })),
      { emitEvents: false },
    );

    return await this.personRepository.getDocumentCountBy({
      name: 'Common Name',
    });
  }

  async getIdFor() {
    return this.personRepository.getIdFor('key_123');
  }

  async getKeyFrom() {
    return this.personRepository.getKeyFrom(`${CollectionName.People}/key_123`);
  }

  async replace(options: { emitEvents: boolean }) {
    const entry = await this.personRepository.save(
      {
        name: 'testname123',
        email: 'example@test.com',
      },
      { emitEvents: false },
    );

    return await this.personRepository.replace(
      entry!._key,
      {
        name: 'replacedname123',
      },
      { returnOld: true, emitEvents: options.emitEvents, data: { order: 0 } },
    );
  }

  async replaceAll(options: { emitEvents: boolean }) {
    const entries = await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `Common Name`,
        email: `email${index}@test.com`,
      })),
      { emitEvents: false, returnFailures: false },
    );

    return await this.personRepository.replaceAll(
      entries.map((entry) => {
        return { ...entry, email: 'replaced.email@test.com' };
      }),
      {
        returnOld: true,
        emitEvents: options.emitEvents,
        returnFailures: false,
      },
    );
  }

  async update(options: { emitEvents: boolean }) {
    const entry = await this.personRepository.save(
      {
        name: 'testname123',
      },
      { emitEvents: false },
    );

    return await this.personRepository.update(
      {
        _key: entry!._key,
        name: 'updatedname123',
      },
      {
        returnOld: true,
        emitEvents: options.emitEvents,
        data: { order: 0 },
      },
    );
  }

  async updateAll(options: { emitEvents: boolean }) {
    const entries = await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `Common Name`,
        email: `email${index}@test.com`,
      })),
      { emitEvents: false, returnFailures: false },
    );

    return await this.personRepository.updateAll(
      entries.map((entry) => {
        return {
          _key: entry._key,
          email: 'updated.email@test.com',
        };
      }),
      {
        returnOld: true,
        emitEvents: options.emitEvents,
        returnFailures: false,
      },
    );
  }

  async upsert(options: { emitEvents: boolean }) {
    await this.personRepository.save(
      {
        name: `Common Name`,
      },
      { emitEvents: false },
    );
    const result: ArangoNewOldResult<Document<PersonEntity> | undefined>[] = [];
    try {
      result[0] = await this.personRepository.upsert(
        {
          name: `Common Name`,
        },
        {
          name: `Inserted Name`,
        },
        {
          name: `Updated Name`,
        },
        { emitEvents: options.emitEvents, data: { order: 0 } },
      );
      result[1] = await this.personRepository.upsert(
        {
          name: `Random Name`,
        },
        {
          name: `Inserted Name`,
        },
        {
          name: `Updated Name`,
        },
        { emitEvents: options.emitEvents, data: { order: 1 } },
      );

      return result;
    } catch (error) {}
  }

  async remove(options: { emitEvents: boolean }) {
    const entry = await this.personRepository.save(
      {
        name: 'testname123',
      },
      { emitEvents: false },
    );

    return await this.personRepository.remove(entry!._key, {
      emitEvents: options.emitEvents,
      data: { order: 0 },
    });
  }

  async removeBy(options: { emitEvents: boolean }) {
    await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
        email: 'common.email@test.com',
      })),
      { emitEvents: false },
    );

    return await this.personRepository.removeBy(
      {
        email: 'common.email@test.com',
      },
      { emitEvents: options.emitEvents },
    );
  }

  async removeAll(options: { emitEvents: boolean }) {
    const entries = await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
        email: 'common.email@test.com',
      })),
      { emitEvents: false, returnFailures: false },
    );

    return await this.personRepository.removeAll(
      entries.map((entry) => entry._key),
      { emitEvents: options.emitEvents },
    );
  }

  async truncate() {
    await this.personRepository.saveAll(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Array.from(new Array(5), (_val, index) => ({
        name: `test${index}`,
        email: 'common.email@test.com',
      })),
      { emitEvents: false },
    );
    await this.personRepository.truncate();

    return await this.personRepository.findAll();
  }

  async updateDecorator() {
    await this.update({ emitEvents: true });

    const result = await this.personRepository.findMany([
      'beforeUpdate0',
      'afterUpdate0',
    ]);
    return result;
  }

  async replaceDecorator() {
    await this.replace({ emitEvents: true });

    const result = await this.personRepository.findMany([
      'beforeReplace0',
      'afterReplace0',
    ]);
    return result;
  }

  async saveDecorator() {
    await this.saveOne({ emitEvents: true });

    const result = await this.personRepository.findMany([
      'beforeSave0',
      'afterSave0',
    ]);
    return result;
  }

  async removeDecorator() {
    const entry = await this.personRepository.save(
      {
        name: 'testname123',
      },
      { emitEvents: false },
    );

    await this.personRepository.remove(entry!._key, {
      data: { order: 0 },
    });

    const result = await this.personRepository.findOne('afterRemove0');
    return result;
  }

  async saveAllDecorator() {
    await this.personRepository.saveAll(
      Array.from(new Array(3), (_, index) => ({ name: `test${index}` })),
      { emitEvents: true },
    );

    return await this.personRepository.findMany([
      'beforeSave0',
      'afterSave0',
      'beforeSave1',
      'afterSave1',
      'beforeSave2',
      'afterSave2',
    ]);
  }

  async updateAllDecorator() {
    const entries = await this.personRepository.saveAll(
      Array.from(new Array(3), (_, index) => ({ name: `test${index}` })),
      { emitEvents: false, returnFailures: false },
    );

    await this.personRepository.updateAll(
      entries.map((entry) => ({ _key: entry._key, name: 'Updated' })),
      { emitEvents: true, returnFailures: false },
    );

    return await this.personRepository.findMany([
      'beforeUpdate0',
      'afterUpdate0',
      'beforeUpdate1',
      'afterUpdate1',
      'beforeUpdate2',
      'afterUpdate2',
    ]);
  }

  async replaceAllDecorator() {
    const entries = await this.personRepository.saveAll(
      Array.from(new Array(3), (_, index) => ({ name: `test${index}` })),
      { emitEvents: false, returnFailures: false },
    );

    await this.personRepository.replaceAll(
      entries.map((entry) => ({ ...entry, name: 'Replaced' })),
      { emitEvents: true, returnFailures: false },
    );

    return await this.personRepository.findMany([
      'beforeReplace0',
      'afterReplace0',
      'beforeReplace1',
      'afterReplace1',
      'beforeReplace2',
      'afterReplace2',
    ]);
  }

  async removeAllDecorator() {
    const entries = await this.personRepository.saveAll(
      Array.from(new Array(3), (_, index) => ({ name: `test${index}` })),
      { emitEvents: false, returnFailures: false },
    );

    await this.personRepository.removeAll(
      entries.map((entry) => entry._key),
      { emitEvents: true },
    );

    return await this.personRepository.findMany([
      'afterRemove0',
      'afterRemove1',
      'afterRemove2',
    ]);
  }

  async findAllWithSort() {
    await this.personRepository.saveAll(
      [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }],
      { emitEvents: false },
    );

    return await this.personRepository.findAll({
      sort: { name: SortDirection.ASC },
    });
  }

  async query() {
    await this.personRepository.saveAll(
      [{ name: 'QueryTest1' }, { name: 'QueryTest2' }],
      { emitEvents: false },
    );

    const cursor = await this.databaseManager.query<PersonEntity>(
      aql`FOR d IN People FILTER STARTS_WITH(d.name, "QueryTest") SORT d.name ASC RETURN d`,
    );

    return await cursor.all();
  }

  async transactionCommit() {
    const trx = await this.databaseManager.beginTransaction({
      write: [CollectionName.People],
    });

    const saved = await this.personRepository.save(
      { name: 'TransactionTest' },
      { emitEvents: false, transaction: trx },
    );

    await trx.commit();

    return await this.personRepository.findOne(saved!._key);
  }

  async transactionAbort() {
    const trx = await this.databaseManager.beginTransaction({
      write: [CollectionName.People],
    });

    const saved = await this.personRepository.save(
      { name: 'RolledBackTest' },
      { emitEvents: false, transaction: trx },
    );

    await trx.abort();

    return await this.personRepository.findOne(saved!._key);
  }

  async edgeOperations() {
    const alice = await this.personRepository.save(
      { name: 'Alice' },
      { emitEvents: false },
    );
    const bob = await this.personRepository.save(
      { name: 'Bob' },
      { emitEvents: false },
    );

    await this.knowsRepository.save(
      { _from: alice!._id, _to: bob!._id },
      { emitEvents: false },
    );

    const allEdges = await this.knowsRepository.edges(alice!._id);
    const inEdges = await this.knowsRepository.inEdges(bob!._id);
    const outEdges = await this.knowsRepository.outEdges(alice!._id);

    return { allEdges, inEdges, outEdges };
  }
}
