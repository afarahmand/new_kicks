Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#index", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  namespace :api, defaults: {format: :json}  do
    get "health", to: "health#index"

    resources :projects, except: [:new, :edit] do
      resources :rewards, only: [:create, :update, :destroy] do
        resources :backings, only: [:create]
      end
    end

    resources :project_discovery, only: [:index]
    resources :project_searches, only: [:index]
    resource :session, only: [:create, :destroy, :show]
    resources :users, only: [:create, :show]
  end
end