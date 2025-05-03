from flask_caching import Cache
from flask import request, current_app
import hashlib
import json

# Initialize cache
cache = Cache()

def configure_cache(app):
    """Configure the cache extension with flexible options"""
    # Get cache configuration from app config
    cache_type = app.config.get('CACHE_TYPE', 'simple')
    
    cache_config = {
        'CACHE_TYPE': cache_type,
        'CACHE_DEFAULT_TIMEOUT': app.config.get('CACHE_DEFAULT_TIMEOUT', 300)
    }
    
    # Configure Redis if specified
    if cache_type == 'redis':
        cache_config.update({
            'CACHE_REDIS_HOST': app.config.get('CACHE_REDIS_HOST', 'localhost'),
            'CACHE_REDIS_PORT': app.config.get('CACHE_REDIS_PORT', 6379),
            'CACHE_REDIS_DB': app.config.get('CACHE_REDIS_DB', 0),
            'CACHE_REDIS_URL': app.config.get('CACHE_REDIS_URL', None)
        })
    
    # Initialize with app
    cache.init_app(app, config=cache_config)
    
    return cache

def cache_key_with_query():
    """Generate a cache key including the query parameters"""
    path = request.path
    args = request.args.to_dict(flat=False)
    
    # Sort args for consistent ordering
    args_str = json.dumps(args, sort_keys=True)
    
    # Create a hash of the arguments to avoid very long keys
    args_hash = hashlib.md5(args_str.encode('utf-8')).hexdigest()
    
    return f"{path}?{args_hash}"

def invalidate_model_cache(model_name):
    """Invalidate all cache entries related to a specific model"""
    # Get list of all tracked keys
    if hasattr(cache, '_cache') and hasattr(cache._cache, 'keys'):
        all_keys = cache._cache.keys()
    else:
        # For Redis or other external caches, we need a different approach
        # For now, return without invalidation for non-simple caches
        return 0
        
    # Filter keys by model name
    keys_to_delete = [k for k in all_keys if model_name.lower() in k.lower()]
    
    # Delete matching keys
    for key in keys_to_delete:
        cache.delete(key)
    
    return len(keys_to_delete)

def invalidate_prefix_cache(prefix):
    """Invalidate all cache entries with a specific prefix"""
    # Get list of all tracked keys
    if hasattr(cache, '_cache') and hasattr(cache._cache, 'keys'):
        all_keys = cache._cache.keys()
    else:
        return 0
        
    # Filter keys by prefix
    keys_to_delete = [k for k in all_keys if k.startswith(prefix)]
    
    # Delete matching keys
    for key in keys_to_delete:
        cache.delete(key)
    
    return len(keys_to_delete)

def cache_for(timeout=300, prefix_key=None, unless=None):
    """Advanced caching decorator with flexible options"""
    def decorator(f):
        @cache.memoize(timeout=timeout, unless=unless)
        def wrapped(*args, **kwargs):
            return f(*args, **kwargs)
            
        # Add attribute to allow specific invalidation
        wrapped.cache_prefix = prefix_key or f.__name__
        
        # Add invalidate method to the wrapped function
        def invalidate_cache(*args, **kwargs):
            key = cache.get_memoize_key(f, *args, **kwargs)
            cache.delete(key)
            
        wrapped.invalidate_cache = invalidate_cache
        
        # Return the modified function
        return wrapped
    return decorator

# Additional caching utilities

def get_model_cache_key(model_name, id=None):
    """Generate a consistent cache key for a model"""
    if id:
        return f"model_{model_name.lower()}_{id}"
    return f"model_{model_name.lower()}_all"

def cache_query_result(model_name, query_func, timeout=300):
    """Cache a database query result"""
    key = get_model_cache_key(model_name)
    result = cache.get(key)
    
    if result is None:
        result = query_func()
        cache.set(key, result, timeout=timeout)
        
    return result

def clear_all_cache():
    """Clear the entire cache"""
    return cache.clear()
