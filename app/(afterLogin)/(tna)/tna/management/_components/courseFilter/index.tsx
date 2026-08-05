import { Button, Form, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { CommonObject } from '@/types/commons/commonObject';
import { FC, useMemo, useState } from 'react';
import { classNames } from '@/utils/classNames';
import { TnaSourceType } from '@/types/tna/externalTna';

interface CourseFilterProps {
  onChange: (value: CommonObject) => void;
  /** `null` means "All" — internal courses and external TNAs together. */
  sourceType?: TnaSourceType | null;
  onSourceTypeChange?: (sourceType: TnaSourceType | null) => void;
}

const SOURCE_TYPE_OPTIONS: {
  label: string;
  value: TnaSourceType | null;
  key: string;
}[] = [
  { label: 'All TNAs', value: null, key: 'all' },
  { label: 'Internal', value: TnaSourceType.INTERNAL, key: 'internal' },
  { label: 'External', value: TnaSourceType.EXTERNAL, key: 'external' },
];

/** Matches design: Tag / Basic — 1px 8px padding, 4px radius, Calibri 12 / 20, black/70 */
const CHIP_CLASS =
  'cursor-pointer box-border inline-flex shrink-0 items-center px-2 py-px rounded-[4px] border border-[#D9D9D9] bg-[rgba(0,0,0,0.02)] text-xs leading-5 font-normal text-black/70 transition-colors whitespace-nowrap font-[Calibri,sans-serif] hover:bg-[rgba(0,0,0,0.04)]';
const CHIP_SELECTED_CLASS =
  'border-[#1E40AF] bg-[rgba(30,64,175,0.06)] text-black/70 ring-1 ring-inset ring-[#1E40AF]';

/** Mobile: Tag / Basic — 29×22 per spec (1px 8px, 4px radius) */
const MOBILE_ALL_CHIP_CLASS = `${CHIP_CLASS} h-[22px] min-h-[22px] min-w-[29px] shrink-0 justify-center px-2`;

const CourseFilter: FC<CourseFilterProps> = ({
  onChange,
  sourceType = null,
  onSourceTypeChange,
}) => {
  const { courseCategory } = useTnaManagementStore();
  const [form] = Form.useForm();
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const selectedCategory = Form.useWatch('courseCategoryId', form);
  const searchValue = Form.useWatch('search', form);

  const hasActiveFilters =
    (typeof searchValue === 'string' && searchValue.trim().length > 0) ||
    !!selectedCategory ||
    !!sourceType;

  const showViewToggle = courseCategory.length > 2;

  const collapsedCategorySlice = useMemo(() => {
    const firstTwo = courseCategory.slice(0, 2);
    if (!selectedCategory) {
      return firstTwo;
    }
    const isInFirstTwo = firstTwo.some((c) => c.id === selectedCategory);
    if (isInFirstTwo) {
      return firstTwo;
    }
    const selected = courseCategory.find((c) => c.id === selectedCategory);
    if (!selected) {
      return firstTwo;
    }
    const filler = courseCategory.find((c) => c.id !== selectedCategory);
    return [selected, filler].filter(Boolean).slice(0, 2) as typeof firstTwo;
  }, [courseCategory, selectedCategory]);

  const clearFilters = () => {
    form.setFieldsValue({ search: undefined, courseCategoryId: undefined });
    onSourceTypeChange?.(null);
    onChange({});
  };

  const sourceTypeChips = (
    <div
      className="flex shrink-0 flex-nowrap items-center gap-[8px]"
      role="group"
      aria-label="Filter by TNA type"
      id="tnaCourseFilterSourceTypeId"
      data-cy="tna-course-filter-source-type"
    >
      {SOURCE_TYPE_OPTIONS.map((option) => {
        const isSelected = sourceType === option.value;
        return (
          <div
            key={option.key}
            role="button"
            tabIndex={0}
            onClick={() => onSourceTypeChange?.(option.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSourceTypeChange?.(option.value);
              }
            }}
            className={classNames(CHIP_CLASS, {
              [CHIP_SELECTED_CLASS]: isSelected,
            })}
            data-cy={`tna-course-filter-source-type-${option.key}`}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );

  const selectAll = () => {
    form.setFieldValue('courseCategoryId', undefined);
    onChange(form.getFieldsValue());
  };

  const renderCategoryChip = (cat: (typeof courseCategory)[0]) => {
    const isSelected = selectedCategory === cat.id;
    return (
      <div
        key={cat.id}
        role="button"
        tabIndex={0}
        onClick={() => {
          form.setFieldValue('courseCategoryId', cat.id);
          onChange(form.getFieldsValue());
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            form.setFieldValue('courseCategoryId', cat.id);
            onChange(form.getFieldsValue());
          }
        }}
        className={`${CHIP_CLASS} ${isSelected ? CHIP_SELECTED_CLASS : ''}`}
        id={`tnaCourseFilterCategory${cat.id}Id`}
        data-cy={`tna-course-filter-category-${cat.id}`}
      >
        {cat.title}
      </div>
    );
  };

  const searchField = (
    <div
      className="flex h-[32px] min-w-0 w-full max-w-[319px] shrink-0 flex-row items-stretch overflow-hidden rounded-[6px] bg-white max-md:max-w-none md:w-[319px] md:max-w-full"
      id="searchCourseFieldId"
      data-cy="search-course-field"
    >
      <div
        className="box-border flex h-[32px] min-h-[32px] min-w-0 flex-1 items-center rounded-l-[6px] border border-r-0 border-[#D9D9D9] bg-white"
        data-cy="tna-course-filter-search-input-wrap"
      >
        <Input
          bordered={false}
          placeholder="Search"
          className="!m-0 !h-[32px] !min-h-[32px] !w-full !border-0 !bg-transparent !px-[11px] !py-0 !text-sm !font-bold !leading-[22px] !text-black !shadow-none placeholder:!font-bold placeholder:!text-black/25 font-[Calibri,sans-serif]"
          data-cy="tna-course-filter-search-input"
        />
      </div>
      <button
        type="button"
        className="box-border flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-r-[6px] border border-[#D9D9D9] bg-white p-0"
        data-cy="tna-course-filter-search-icon-wrap"
        aria-label="Search"
      >
        <SearchOutlined
          className="text-[16px] text-black/70"
          data-cy="tna-course-filter-search-icon"
        />
      </button>
    </div>
  );

  const mobileAllChip = (
    <div
      role="button"
      tabIndex={0}
      onClick={selectAll}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectAll();
        }
      }}
      className={classNames(MOBILE_ALL_CHIP_CLASS, {
        [CHIP_SELECTED_CLASS]: !selectedCategory,
      })}
      id="tnaCourseFilterCategoryAllMobileId"
      data-cy="tna-course-filter-category-all-mobile"
    >
      All
    </div>
  );

  const desktopAllChip = (
    <div
      role="button"
      tabIndex={0}
      onClick={selectAll}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectAll();
        }
      }}
      className={classNames(CHIP_CLASS, {
        [CHIP_SELECTED_CLASS]: !selectedCategory,
      })}
      id="tnaCourseFilterCategoryAllId"
      data-cy="tna-course-filter-category-all"
    >
      All
    </div>
  );

  const renderViewToggle = (
    dataCySuffix: string,
    variant: 'desktop' | 'mobile' = 'desktop',
  ) =>
    showViewToggle ? (
      <Button
        type="link"
        className={classNames(
          '!m-0 inline-flex !h-[24px] flex-none items-center !py-0 !text-sm !font-normal !leading-[22px] !text-[#1E40AF] font-[Calibri,sans-serif] !no-underline shadow-none hover:!text-[#1E40AF] hover:!no-underline',
          {},
          [
            variant === 'mobile'
              ? '!min-w-0 !w-full !justify-end !px-0'
              : 'min-w-[77px] !justify-center !px-[7px]',
          ],
        )}
        onClick={() => setFiltersExpanded((v) => !v)}
        data-cy={
          (filtersExpanded
            ? 'tna-course-filter-view-less'
            : 'tna-course-filter-view-more') + dataCySuffix
        }
      >
        {filtersExpanded ? 'View Less' : 'View More'}
      </Button>
    ) : null;

  /** Fixed-width right column so View More / View Less stay on the same edge on mobile. */
  const mobileViewToggleSlot = showViewToggle ? (
    <div
      className="box-border flex h-[32px] w-[88px] shrink-0 items-center justify-end self-center"
      data-cy="tna-course-filter-mobile-view-toggle-wrap"
    >
      {renderViewToggle('-mobile', 'mobile')}
    </div>
  ) : null;

  return (
    <Form
      form={form}
      onValuesChange={() => {
        onChange(form.getFieldsValue());
      }}
      id="tnaCourseFilterFormId"
      data-cy="tna-course-filter-form"
      className="w-full"
    >
      <div
        className="flex w-full flex-col gap-2 md:gap-0"
        data-cy="tna-course-filter-toolbar"
      >
        <Form.Item name="courseCategoryId" className="mb-0 hidden">
          <Input />
        </Form.Item>

        {/* Row 0: internal vs external TNAs — scrolls horizontally on mobile. */}
        <div
          className="scrollbar-hide -mx-1 flex w-[calc(100%+0.5rem)] flex-nowrap items-center gap-[8px] overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pb-2 touch-pan-x md:mx-0 md:w-full md:overflow-visible md:pb-1"
          data-cy="tna-course-filter-source-type-row"
        >
          {sourceTypeChips}
        </div>

        {/* Row 1: mobile collapsed = search + All + View More | mobile expanded = All + chips + View Less (no search) | md+ = search + desktop chips */}
        <div
          className={classNames(
            'flex min-h-[32px] w-full flex-row items-center gap-[10px] md:min-h-[32px] md:justify-between',
            {
              'md:justify-end max-md:flex-nowrap max-md:items-center max-md:gap-2':
                filtersExpanded,
              'max-md:flex-nowrap max-md:justify-between': !filtersExpanded,
            },
          )}
          data-cy="tna-course-filter-toolbar-row"
        >
          <Form.Item
            name="search"
            className={classNames(
              'mb-0 min-w-0 max-w-[319px] max-md:flex-1 max-md:min-w-0 md:shrink-0 md:flex-none',
              {},
              [filtersExpanded ? '!hidden' : 'md:w-[319px] md:max-w-full'],
            )}
            id="tnaCourseFilterSearchItemId"
            data-cy="tna-course-filter-search-item"
          >
            {searchField}
          </Form.Item>

          <div
            className={classNames('items-center gap-2 md:hidden', {
              'flex min-w-0 flex-1': filtersExpanded,
              'flex shrink-0': !filtersExpanded,
            })}
            data-cy="tna-course-filter-mobile-leading-actions"
          >
            {filtersExpanded ? (
              <>
                <div
                  className="scrollbar-hide flex min-h-[32px] min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x"
                  data-cy="tna-course-filter-mobile-chips-scroll"
                >
                  {mobileAllChip}
                  {courseCategory.map((cat) => renderCategoryChip(cat))}
                </div>
                {mobileViewToggleSlot}
              </>
            ) : (
              <>
                {mobileAllChip}
                {mobileViewToggleSlot}
              </>
            )}
          </div>

          <div
            className={classNames(
              'hidden min-w-0 flex-1 items-center justify-end gap-[8px] md:flex',
              {},
              [filtersExpanded ? 'w-full' : ''],
            )}
            id="tnaCourseFilterCategoriesId"
            data-cy="tna-course-filter-categories-row"
          >
            <div
              className={classNames(
                'flex min-h-[24px] min-w-0 flex-wrap items-center justify-end gap-[8px]',
                {},
                [filtersExpanded ? 'flex-1' : ''],
              )}
              data-cy="tna-course-filter-chips-wrap"
            >
              {desktopAllChip}
              {(filtersExpanded ? courseCategory : collapsedCategorySlice).map(
                (cat) => renderCategoryChip(cat),
              )}
            </div>
            <div
              className="flex h-[24px] shrink-0 flex-nowrap items-center gap-[8px] self-center"
              data-cy="tna-course-filter-actions-trailing"
            >
              {renderViewToggle('')}
              {hasActiveFilters && (
                <Button
                  type="link"
                  className="!m-0 inline-flex !h-[24px] flex-none items-center justify-center !px-[7px] !py-0 !text-sm !font-normal !leading-[22px] !text-[#1E40AF] font-[Calibri,sans-serif] !no-underline shadow-none hover:!text-[#1E40AF] hover:!no-underline"
                  onClick={clearFilters}
                  data-cy="tna-course-filter-clear"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div
            className="flex md:hidden justify-end w-full"
            data-cy="tna-course-filter-clear-mobile-row"
          >
            <Button
              type="link"
              className="!m-0 inline-flex !h-[24px] flex-none items-center justify-center !px-[7px] !py-0 !text-sm !font-normal !leading-[22px] !text-[#1E40AF] font-[Calibri,sans-serif] !no-underline shadow-none hover:!text-[#1E40AF] hover:!no-underline"
              onClick={clearFilters}
              data-cy="tna-course-filter-clear-mobile"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
};

export default CourseFilter;
