import { ArangoDocumentEdge, Collection } from '../../../src';
import { CollectionName } from '../enums/collection-name.enum';

@Collection(CollectionName.Knows)
export class KnowsEntity extends ArangoDocumentEdge {}
