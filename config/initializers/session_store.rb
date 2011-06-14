# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_full_tilt_session',
  :secret      => '9a90bce84e47a9872bd42abc8499e9fe207accc3f201ad54adfc269768d6403a859f8e6d12bac34dfce8ba6cd662a66e0355f7ef6072492c7c87c9ff1570fed6'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
