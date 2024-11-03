from App import get_app
from waitress import serve
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_app():
    try:
        app = get_app()
        env = os.environ.get('FLASK_ENV', 'production')
        port = int(os.environ.get('PORT', 5000))
        
        if env == 'development':
            logger.info('Starting development server...')
            app.run(debug=True, port=port)
        else:
            logger.info('Starting production server...')
            serve(app, host='127.0.0.1', port=port)
            
    except Exception as e:
        logger.error(f'Failed to start server: {str(e)}')
        sys.exit(1)

if __name__ == '__main__':
    run_app()
