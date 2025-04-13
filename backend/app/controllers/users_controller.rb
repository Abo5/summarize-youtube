# app/controllers/users_controller.rb
class UsersController < ApplicationController
  # POST (و OPTIONS) /users/cookies
  def create
    # إذا كان الطلب OPTIONS، نرد برأس فارغ (status: 200)
    if request.options?
      head :ok
      return
    end

    # --- من هنا يبدأ منطق الـ POST الفعلي ---
    @user = User.find_by(visitor_id: user_params[:visitor_id])
    cookie_token = SecureRandom.hex(16)

    if @user
      @user.update(
        ip: user_params[:ip],
        country: user_params[:country],
        device: user_params[:device],
        cookie_token: cookie_token
      )

      cookies[:user_cookie] = {
        value: cookie_token,
        expires: 10.day.from_now,
        httponly: true,
        secure: Rails.env.production?
      }

      render json: {
        message: "User data has been successfully updated and cookie replaced.",
        cookie: cookies[:user_cookie]
      }, status: :ok

    else
      @user = User.new(user_params.merge(cookie_token: cookie_token))

      if @user.save
        cookies[:user_cookie] = {
          value: cookie_token,
          expires: 1.day.from_now,
          httponly: true,
          secure: Rails.env.production?
        }

        render json: {
          message: "A new user has been successfully created and the cookie has been set.",
          cookie: cookies[:user_cookie]
        }, status: :created
      else
        render json: {
          errors: @user.errors.full_messages
        }, status: :unprocessable_entity
      end
    end
  end

  private

  def user_params
    params.require(:user).permit(
      :visitor_id, :ip, :country, :device, :cookie_token,
      :os, :browser, :screen_width, :screen_height, :is_mobile, :timezone, :language, :connection_type,
      :session_id, :session_duration, :page_views, :first_visit_date, :last_visit_date, :visit_count, :days_since_last_visit,
      :clicks, :scrolls, :forms_submitted, :entry_page, :exit_page, :avg_time_on_page, :bounce_rate,
      :referrer, :utm_source, :utm_medium, :utm_campaign, :utm_content, :campaign_id,
      :products_viewed, :products_added_to_cart, :checkout_started, :purchase_completed, :order_value, :payment_method, :coupon_used,
      :city, :region, :postal_code, :isp, :latitude, :longitude,
      additional_data: {}
    )
  end
end
