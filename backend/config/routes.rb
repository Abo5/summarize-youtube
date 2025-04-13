Rails.application.routes.draw do
  # resources :users
  match '/users/cookies', to: 'users#create', via: [:post, :options]
  resources :videos, only: [:show]
  get "up" => "rails/health#show", as: :rails_health_check
end
