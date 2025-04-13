# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      # Replace http://localhost:4000 with your Next.js dev origin
      origins 'http://127.0.0.1:4000'
      
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        expose: ['Set-Cookie'], # if you need to expose certain headers
        credentials: true       # if you want to allow cookies
    end
  end
  