import DiscoverByGenre from '@app/components/Discover/DiscoverByGenre';
import type { NextPage } from 'next';

// TMDB genre 99 = Documentary
const DiscoverDocumentalesPage: NextPage = () => {
  return <DiscoverByGenre title="Documentales" genreId={99} />;
};

export default DiscoverDocumentalesPage;
