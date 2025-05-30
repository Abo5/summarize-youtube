class AddDashboardFieldsToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :os, :string
    add_column :users, :browser, :string
    add_column :users, :screen_width, :integer
    add_column :users, :screen_height, :integer
    add_column :users, :is_mobile, :boolean
    add_column :users, :timezone, :string
    add_column :users, :language, :string
    add_column :users, :connection_type, :string
    add_column :users, :session_id, :string
    add_column :users, :session_duration, :integer
    add_column :users, :page_views, :integer
    add_column :users, :first_visit_date, :datetime
    add_column :users, :last_visit_date, :datetime
    add_column :users, :visit_count, :integer
    add_column :users, :days_since_last_visit, :integer
    add_column :users, :clicks, :integer
    add_column :users, :scrolls, :integer
    add_column :users, :forms_submitted, :integer
    add_column :users, :entry_page, :string
    add_column :users, :exit_page, :string
    add_column :users, :avg_time_on_page, :float
    add_column :users, :bounce_rate, :float
    add_column :users, :referrer, :string
    add_column :users, :utm_source, :string
    add_column :users, :utm_medium, :string
    add_column :users, :utm_campaign, :string
    add_column :users, :utm_content, :string
    add_column :users, :campaign_id, :string
    add_column :users, :products_viewed, :integer
    add_column :users, :products_added_to_cart, :integer
    add_column :users, :checkout_started, :boolean
    add_column :users, :purchase_completed, :boolean
    add_column :users, :order_value, :decimal, precision: 10, scale: 2
    add_column :users, :payment_method, :string
    add_column :users, :coupon_used, :string
    add_column :users, :city, :string
    add_column :users, :region, :string
    add_column :users, :postal_code, :string
    add_column :users, :isp, :string
    add_column :users, :latitude, :float
    add_column :users, :longitude, :float
    # استخدام :text بدلاً من :jsonb لأن SQLite لا يدعم JSONB
    add_column :users, :additional_data, :text
  end
end
