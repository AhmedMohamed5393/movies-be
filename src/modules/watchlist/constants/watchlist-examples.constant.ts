export const addToWatchListResponse = {
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-01-13T23:34:55.431Z",
      "updated_at": "2025-01-13T23:34:55.431Z",
      "deleted_at": null
    },
    "message": "movie is added to user's watchlist successfully",
    "status": true
}; 

export const findWatchListItemsResponse = {
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
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "movie": {
            "id": "550e8400-e29b-41d4-a716-446655440022",
            "title": "New movie title",
            "avg_rating": 4.7,
          },
          "created_at": "2025-01-13T22:53:41.354Z",
        }
      ]
    },
    "message": "OPERATION_SUCCESSED",
    "status": true
};

export const removeFromWatchListItemResponse = {
    "data": {},
    "message": "The watchlist item is removed successfully",
    "status": true
};
