def test_get_bakery_reviews(client, mocker):
    mock_reviews = [{"id": 1, "review": "Great bakery!"}]
    mocker.patch("services.review_service.ReviewService.get_all_bakery_reviews", return_value=mock_reviews)

    response = client.get("/bakeryreview/")
    assert response.status_code == 200
    assert response.json == {"bakeryreviews": mock_reviews}


def test_get_bakery_reviews_by_bakery(client, mocker):
    mock_reviews = [{"id": 1, "review": "Amazing bread!"}]
    mocker.patch("models.Bakery.query.get", return_value=True)
    mocker.patch("services.review_service.ReviewService.get_bakery_reviews_by_bakery", return_value=mock_reviews)

    response = client.get("/bakeryreview/bakery/1")
    assert response.status_code == 200
    assert response.json == {"bakeryreviews": mock_reviews}


def test_get_bakery_reviews_by_bakery_not_found(client, mocker):
    mocker.patch("models.Bakery.query.get", return_value=None)

    response = client.get("/bakeryreview/bakery/999")
    assert response.status_code == 404
    assert response.json == {"message": "Bakery not found"}


def test_create_bakery_review(client, mocker):
    mock_data = {
        "review": "Excellent service!",
        "overallRating": 9,
        "serviceRating": 8,
        "priceRating": 7,
        "atmosphereRating": 10,
        "locationRating": 9,
        "bakeryId": 1,
    }
    mock_review = {"id": 1, "review": "Excellent service!"}
    mocker.patch("models.Bakery.query.get", return_value=True)
    mocker.patch("services.review_service.ReviewService.create_bakery_review", return_value=mock_review)
    mocker.patch("utils.caching.cache.delete")

    response = client.post("/bakeryreview/create", json=mock_data)
    assert response.status_code == 201
    assert response.json == {"message": "Bakery review created!", "review": mock_review}


def test_create_bakery_review_missing_field(client):
    mock_data = {
        "review": "Excellent service!",
        "overallRating": 9,
        "serviceRating": 8,
        "priceRating": 7,
        "atmosphereRating": 10,
    }

    response = client.post("/bakeryreview/create", json=mock_data)
    assert response.status_code == 400
    assert response.json == {"message": "Missing required field: locationRating"}


def test_update_bakery_review(client, mocker):
    mock_data = {
        "review": "Updated review",
        "overallRating": 8,
        "serviceRating": 7,
        "priceRating": 6,
        "atmosphereRating": 9,
        "locationRating": 8,
        "bakeryId": 1,
    }
    mock_review = {"id": 1, "review": "Updated review"}
    mocker.patch("models.BakeryReview.query.get", return_value=True)
    mocker.patch("models.Bakery.query.get", return_value=True)
    mocker.patch("services.review_service.ReviewService.update_bakery_review", return_value=mock_review)
    mocker.patch("utils.caching.cache.delete")

    response = client.patch("/bakeryreview/update/1", json=mock_data)
    assert response.status_code == 200
    assert response.json == {"message": "Bakery review updated.", "review": mock_review}


def test_delete_bakery_review(client, mocker):
    mocker.patch("models.BakeryReview.query.get", return_value=True)
    mocker.patch("services.review_service.ReviewService.delete_bakery_review")
    mocker.patch("utils.caching.cache.delete")

    response = client.delete("/bakeryreview/delete/1")
    assert response.status_code == 200
    assert response.json == {"message": "Bakery review deleted!"}


def test_get_pastry_reviews(client, mocker):
    mock_reviews = [{"id": 1, "review": "Delicious pastry!"}]
    mocker.patch("services.review_service.ReviewService.get_all_pastry_reviews", return_value=mock_reviews)

    response = client.get("/pastryreview/")
    assert response.status_code == 200
    assert response.json == {"pastryreviews": mock_reviews}


def test_create_pastry_review(client, mocker):
    mock_data = {
        "review": "Amazing taste!",
        "overallRating": 10,
        "tasteRating": 9,
        "priceRating": 8,
        "presentationRating": 10,
        "pastryId": 1,
    }
    mock_review = {"id": 1, "review": "Amazing taste!"}
    mocker.patch("models.Pastry.query.get", return_value=True)
    mocker.patch("services.review_service.ReviewService.create_pastry_review", return_value=mock_review)
    mocker.patch("utils.caching.cache.delete")

    response = client.post("/pastryreview/create", json=mock_data)
    assert response.status_code == 201
    assert response.json == {"message": "Pastry review created!", "review": mock_review}


def test_update_pastry_review(client, mocker):
    mock_data = {
        "review": "Updated pastry review",
        "overallRating": 9,
        "tasteRating": 8,
        "priceRating": 7,
        "presentationRating": 9,
        "pastryId": 1,
    }
    mock_review = {"id": 1, "review": "Updated pastry review"}
    mocker.patch("models.PastryReview.query.get", return_value=True)
    mocker.patch("models.Pastry.query.get", return_value=True)
    mocker.patch("services.review_service.ReviewService.update_pastry_review", return_value=mock_review)
    mocker.patch("utils.caching.cache.delete")

    response = client.patch("/pastryreview/update/1", json=mock_data)
    assert response.status_code == 200
    assert response.json == {"message": "Pastry review updated.", "review": mock_review}


def test_delete_pastry_review(client, mocker):
    mocker.patch("models.PastryReview.query.get", return_value=True)
    mocker.patch("services.review_service.ReviewService.delete_pastry_review")
    mocker.patch("utils.caching.cache.delete")

    response = client.delete("/pastryreview/delete/1")
    assert response.status_code == 200
    assert response.json == {"message": "Pastry review deleted!"}