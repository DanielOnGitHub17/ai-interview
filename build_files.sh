# Create a virtual environment
python3 -m venv venv

# Activate it
. venv/bin/activate

# Install dependencies inside the venv
pip install --upgrade pip
pip install -r requirements.txt

# Run collectstatic using the venv's python
python manage.py collectstatic --noinput
