import Button from '@app/components/Common/Button';
import Header from '@app/components/Common/Header';
import ListView from '@app/components/Common/ListView';
import PageTitle from '@app/components/Common/PageTitle';
import type { FilterOptions } from '@app/components/Discover/constants';
import {
  countActiveFilters,
  prepareFilterValues,
} from '@app/components/Discover/constants';
import FilterSlideover from '@app/components/Discover/FilterSlideover';
import useDiscover from '@app/hooks/useDiscover';
import { useUpdateQueryParams } from '@app/hooks/useUpdateQueryParams';
import ErrorPage from '@app/pages/_error';
import { BarsArrowDownIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { ANIME_KEYWORD_ID } from '@server/api/themoviedb/constants';
import type { MovieResult, TvResult } from '@server/models/Search';
import { useRouter } from 'next/router';
import { useState } from 'react';

type AnimeType = 'tv' | 'movie';

const DiscoverAnime = () => {
  const router = useRouter();
  const updateQueryParams = useUpdateQueryParams({});
  const [mediaType, setMediaType] = useState<AnimeType>('tv');
  const [showFilters, setShowFilters] = useState(false);

  const preparedFilters = prepareFilterValues(router.query);

  // Always constrain results to anime via TMDB's anime keyword, merged with
  // any keyword the user picked in the filter slideover.
  const animeFilters = {
    ...preparedFilters,
    keywords: preparedFilters.keywords
      ? `${preparedFilters.keywords},${ANIME_KEYWORD_ID}`
      : `${ANIME_KEYWORD_ID}`,
  };

  const endpoint =
    mediaType === 'movie' ? '/api/v1/discover/movies' : '/api/v1/discover/tv';

  const {
    isLoadingInitialData,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    titles,
    fetchMore,
    error,
  } = useDiscover<MovieResult | TvResult, unknown, FilterOptions>(
    endpoint,
    animeFilters
  );

  if (error) {
    return <ErrorPage statusCode={500} />;
  }

  const segments: { key: AnimeType; label: string }[] = [
    { key: 'tv', label: 'Series' },
    { key: 'movie', label: 'Películas' },
  ];

  return (
    <>
      <PageTitle title="Anime" />
      <div className="mb-4 flex flex-col justify-between lg:flex-row lg:items-end">
        <Header>Anime</Header>
        <div className="mt-2 flex flex-grow flex-col sm:flex-row lg:flex-grow-0">
          <div className="mb-2 flex flex-grow rounded-md bg-gray-800 p-1 sm:mb-0 sm:mr-2 lg:flex-grow-0">
            {segments.map((segment) => (
              <button
                key={segment.key}
                type="button"
                onClick={() => setMediaType(segment.key)}
                className={`flex-1 rounded px-4 py-1 text-sm font-semibold transition lg:flex-grow-0 ${
                  mediaType === segment.key
                    ? 'bg-indigo-500 text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {segment.label}
              </button>
            ))}
          </div>
          <div className="mb-2 flex flex-grow sm:mb-0 sm:mr-2 lg:flex-grow-0">
            <span className="inline-flex cursor-default items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100 sm:text-sm">
              <BarsArrowDownIcon className="h-6 w-6" />
            </span>
            <select
              id="sortBy"
              name="sortBy"
              className="rounded-r-only"
              value={preparedFilters.sortBy || 'popularity.desc'}
              onChange={(e) => updateQueryParams('sortBy', e.target.value)}
            >
              <option value="popularity.desc">Popularidad ↓</option>
              <option value="popularity.asc">Popularidad ↑</option>
              <option value="vote_average.desc">Puntuación ↓</option>
              <option value="vote_average.asc">Puntuación ↑</option>
              <option value="first_air_date.desc">Más reciente</option>
            </select>
          </div>
          <FilterSlideover
            type={mediaType}
            currentFilters={preparedFilters}
            onClose={() => setShowFilters(false)}
            show={showFilters}
          />
          <div className="mb-2 flex flex-grow sm:mb-0 lg:flex-grow-0">
            <Button onClick={() => setShowFilters(true)} className="w-full">
              <FunnelIcon />
              <span>
                {countActiveFilters(preparedFilters) > 0
                  ? `${countActiveFilters(preparedFilters)} filtros`
                  : 'Filtros'}
              </span>
            </Button>
          </div>
        </div>
      </div>
      <ListView
        items={titles}
        isEmpty={isEmpty}
        isLoading={
          isLoadingInitialData || (isLoadingMore && (titles?.length ?? 0) > 0)
        }
        isReachingEnd={isReachingEnd}
        onScrollBottom={fetchMore}
      />
    </>
  );
};

export default DiscoverAnime;
