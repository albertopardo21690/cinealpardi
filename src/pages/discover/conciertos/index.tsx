import DiscoverByGenre from '@app/components/Discover/DiscoverByGenre';
import type { NextPage } from 'next';

// TMDB genre 10402 = Music (concert films, music documentaries)
const DiscoverConciertosPage: NextPage = () => {
  return <DiscoverByGenre title="Conciertos" genreId={10402} />;
};

export default DiscoverConciertosPage;
