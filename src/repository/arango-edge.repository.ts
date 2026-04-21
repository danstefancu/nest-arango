import { Injectable } from '@nestjs/common';
import { DocumentEdgesOptions, DocumentSelector } from 'arangojs/documents';
import { ArangoDocumentEdge } from '../documents';
import { ArangoRepository } from './arango.repository';

@Injectable()
export class ArangoEdgeRepository<
  T extends ArangoDocumentEdge,
> extends ArangoRepository<T> {
  async edges(selector: DocumentSelector, options?: DocumentEdgesOptions) {
    // arangojs collection.edges() omits direction; ArangoDB requires direction='any'
    const result = await (this.collection as any)._edges(selector, options ?? {}, 'any');
    return result.edges;
  }

  async inEdges(selector: DocumentSelector, options?: DocumentEdgesOptions) {
    const result = await this.collection.inEdges(selector, options);
    return result.edges;
  }

  async outEdges(selector: DocumentSelector, options?: DocumentEdgesOptions) {
    const result = await this.collection.outEdges(selector, options);
    return result.edges;
  }
}
