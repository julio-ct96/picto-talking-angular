import { InjectionToken } from '@angular/core';

import { MaterialEntity } from '../../domain/entities/material.entity';
import { KeywordEntity } from '../../domain/entities/keyword.entity';
import { PictogramEntity } from '../../domain/entities/pictogram.entity';
import { LocaleCode } from '../../domain/value-objects/locale-code';
import { NewItemType } from '../../domain/value-objects/new-item-type';
import { PictogramSearchStrategy } from '../../domain/value-objects/pictogram-search-strategy';

export interface PictogramOptions {
  readonly plural?: boolean;
  readonly color?: boolean;
  readonly backgroundColor?: string;
  readonly action?: 'future' | 'past';
  readonly resolution?: 500 | 2500;
  readonly skin?: 'white' | 'black' | 'assian' | 'mulatto' | 'aztec';
  readonly hair?:
    | 'blonde'
    | 'brown'
    | 'darkBrown'
    | 'gray'
    | 'darkGray'
    | 'red'
    | 'black';
  readonly identifier?: 'classroom' | 'health' | 'library' | 'office';
  readonly identifierPosition?: 'left' | 'right';
  readonly url?: boolean;
  readonly download?: boolean;
}

export interface SearchPictogramsParams {
  readonly language: LocaleCode;
  readonly term: string;
  readonly strategy: PictogramSearchStrategy;
  readonly options?: PictogramOptions;
}

export interface GetPictogramDetailsParams {
  readonly language: LocaleCode;
  readonly id: number;
  readonly locales?: readonly LocaleCode[];
  readonly options?: PictogramOptions;
}

export interface SearchMaterialsParams {
  readonly language: LocaleCode;
  readonly term: string;
  readonly days?: number;
  readonly limit?: number;
}

export interface GetNewItemsParams<TType extends NewItemType = NewItemType> {
  readonly language: LocaleCode;
  readonly type: TType;
  readonly window?: number;
  readonly limit?: number;
}

export type NewItemsResult<TType extends NewItemType> = TType extends 'pictograms'
  ? readonly PictogramEntity[]
  : readonly MaterialEntity[];

export interface ArasaacRepository {
  fetchKeywords(language: LocaleCode): Promise<readonly KeywordEntity[]>;
  searchPictograms(params: SearchPictogramsParams): Promise<readonly PictogramEntity[]>;
  getPictogramDetails(
    params: GetPictogramDetailsParams,
  ): Promise<PictogramEntity | readonly PictogramEntity[]>;
  searchMaterials(params: SearchMaterialsParams): Promise<readonly MaterialEntity[]>;
  getMaterialById(id: number): Promise<MaterialEntity>;
  getNewItems<TType extends NewItemType>(
    params: GetNewItemsParams<TType>,
  ): Promise<NewItemsResult<TType>>;
}

export const ARASAAC_REPOSITORY = new InjectionToken<ArasaacRepository>(
  'ARASAAC_REPOSITORY',
);
