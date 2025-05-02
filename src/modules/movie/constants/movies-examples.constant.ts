export const findMoviesListResponse = {
    "data": {
      "meta": {
        "page": 1,
        "take": 10,
        "itemsPerPage": 1,
        "total": 1,
        "pageCount": 1,
        "hasPreviousPage": false,
        "hasNextPage": false
      },
      "movies": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "title": "New movie title",
          "overview": "New movie overview",
          "release_date": "2025-01-13T22:53:41.354Z",
          "poster": {
            "id": "550e8400-e29b-41d4-a716-446655440044",
            "email": "ahmedmohamedalex93@gmail.com",
          },
          "avg_rating": 4.7,
          "created_at": "2025-01-13T22:53:41.354Z"
        }
      ]
    },
    "message": "OPERATION_SUCCESSED",
    "status": true
};

export const findMovieDetailsResponse = {
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "New movie title",
      "overview": "New movie overview",
      "poster_path": null,
      "release_date": "2025-01-13T22:53:41.354Z",
      "poster": {
        "id": "550e8400-e29b-41d4-a716-446655440044",
        "email": "ahmedmohamedalex93@gmail.com",
      },
      "avg_rating": 4.7,
      "created_at": "2025-01-13T22:53:41.354Z",
    },
    "message": "OPERATION_SUCCESSED",
    "status": true
};
