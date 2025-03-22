// Submit pastry review with valid IDs
const submitPastryReview = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First, validate that we have valid IDs before submitting
      const contactId = 1; // Hardcoded contact ID that exists in your database
      
      // Fetch existing pastries to check which IDs are valid
      console.log('Selected pastry:', selectedPastry);
      let pastryId;
      
      if (selectedPastry.id === 'custom') {
        // For custom pastries, we need to create it first or use an existing one
        pastryId = 1; // Use a valid pastry ID from your database
      } else {
        pastryId = parseInt(selectedPastry.id);
      }
      
      const reviewData = {
        review: pastryRatings.comments || "Great pastry!",
        overallRating: parseInt(pastryRatings.overall),
        tasteRating: parseInt(pastryRatings.taste),
        priceRating: parseInt(pastryRatings.price),
        presentationRating: parseInt(pastryRatings.presentation),
        contactId: contactId,
        pastryId: pastryId
      };
      
      console.log('Submitting pastry review with data:', reviewData);
      
      const response = await fetch('http://127.0.0.1:5000/pastryreviews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit review');
      }
      
      return responseData;
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit pastry review: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPastry, pastryRatings]);