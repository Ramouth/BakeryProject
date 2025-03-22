from flask_caching import Cache

# Initialize cache
cache = Cache()

def configure_cache(app):
    """Configure the cache extension"""
    # Get cache configuration from app config
    cache_config = {
        'CACHE_TYPE': app.config.get('CACHE_TYPE', 'simple'),
        'CACHE_DEFAULT_TIMEOUT': app.config.get('CACHE_DEFAULT_TIMEOUT', 300)
    }
    
    # For Redis cache configuration
    if cache_config['CACHE_TYPE'] == 'redis':
        cache_config.update({
            'CACHE_REDIS_HOST': app.config.get('CACHE_REDIS_HOST', 'localhost'),
            'CACHE_REDIS_PORT': app.config.get('CACHE_REDIS_PORT', 6379),
            'CACHE_REDIS_DB': app.config.get('CACHE_REDIS_DB', 0),
            'CACHE_REDIS_URL': app.config.get('CACHE_REDIS_URL', None)
        })
    
    # Initialize with app
    cache.init_app(app, config=cache_config)
    
    return cache

def invalidate_model_cache(model_name):
    """Invalidate all cache entries related to a specific model"""
    # This is a simplistic approach, in a production environment
    # you would use Redis SCAN command or similar to identify related keys
    keys_to_delete = []
    
    # Get all keys from cache
    # Note: This depends on the cache type; for simple cache we can access _cache directly
    if hasattr(cache, '_cache') and hasattr(cache._cache, 'keys'):
        all_keys = cache._cache.keys()
        
        for key in all_keys:
            if model_name.lower() in key.lower():
                keys_to_delete.append(key)
    
    # Delete matching keys
    for key in keys_to_delete:
        cache.delete(key)
    
    return len(keys_to_delete)

def memoize_with_custom_key(timeout=300):
    """Decorator for memoizing a function with a custom key"""
    def decorator(f):
        def wrapper(*args, **kwargs):
            # Create a custom key based on function name and arguments
            key = f"custom:{f.__name__}:{str(args)}:{str(kwargs)}"
            
            # Get from cache if exists
            cached_result = cache.get(key)
            if cached_result is not None:
                return cached_result
            
            # Call function and cache result
            result = f(*args, **kwargs)
            cache.set(key, result, timeout=timeout)
            return result
        return wrapper
    return decorator