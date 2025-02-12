import React, { useState, useEffect } from 'react';
import '../styles/Favorite.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Favorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://localhost:8080/favorite/favorites', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch favorites: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched Favorites:', data); // Debugging

        if (!Array.isArray(data.favorites)) {
          throw new Error('Invalid response format: Expected an array');
        }

        setFavorites(data.favorites);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:8080/favorite/remove-from-favorites/${bookId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Update state after removing a favorite
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.bookId._id !== bookId));
    } catch (error) {
      console.error(error);
    }
    window.location.reload();
  };

  return (
    <div className='favorite'>
      <div style={{ margin: '50px' }} className='data'>
        {loading ? (
          <p>Loading favorites...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : favorites.length === 0 ? (
          <p>No favorites added yet.</p>
        ) : (
          favorites.map((favorite) => (
            <div key={favorite.bookId._id}>
              <img 
                src={`http://localhost:8080/${favorite.bookId.image}`} 
                alt={favorite.bookId.title} 
                width={100} 
                height={150} 
                onError={(e) => e.target.src = '/fallback-image.jpg'} // Handle broken images
              />
              <h4 style={{ fontSize: '20px' }}>{favorite.bookId.title}</h4>
              <span className='flex-display'>
                <button className='add-to-cart'>Add To Bag</button>
                <FontAwesomeIcon 
                  icon={faTrash} 
                  onClick={() => handleRemoveFavorite(favorite.bookId._id)}
                  style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }}
                />
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorite;
