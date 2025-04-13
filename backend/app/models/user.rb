class User < ApplicationRecord
    # التحقق من البيانات الأساسية
    validates :visitor_id, presence: true, uniqueness: true
    validates :ip, presence: true
    validates :country, presence: true
    validates :device, presence: true
    
    # التحقق من البيانات العددية
    validates :screen_width, :screen_height, numericality: { only_integer: true, allow_nil: true }
    validates :session_duration, :page_views, :visit_count, numericality: { only_integer: true, allow_nil: true }
    validates :order_value, numericality: { allow_nil: true }
    
    # التحقق من التواريخ
    validates :first_visit_date, :last_visit_date, presence: true, if: -> { visit_count.present? && visit_count > 1 }
    
    # طرق مساعدة
    def self.recent_visitors(days = 7)
      where('last_visit_date >= ?', days.days.ago)
    end
    
    def self.from_country(country_code)
      where(country: country_code)
    end
    
    def self.mobile_users
      where(is_mobile: true)
    end
    
    def self.desktop_users
      where(is_mobile: false)
    end
    
    def self.campaign_visitors(campaign)
      where(utm_campaign: campaign)
    end
    
    def self.converted_users
      where(purchase_completed: true)
    end
    
    # تحويل البيانات الإضافية من وإلى JSON
    def buttons_clicked=(value)
      self.additional_data ||= {}
      self.additional_data['buttons_clicked'] = value
    end
    
    def buttons_clicked
      additional_data&.dig('buttons_clicked')
    end
    
    # طرق للإحصائيات
    def last_activity_days_ago
      return nil unless last_visit_date
      (Date.current - last_visit_date.to_date).to_i
    end
    
    def conversion_rate
      return nil unless products_viewed.to_i > 0
      purchase_completed ? (1.0 / products_viewed.to_i) : 0
    end
    
    # قبل الحفظ، تحديث بعض البيانات المشتقة
    before_save :update_derived_fields, if: -> { last_visit_date_changed? }
    
    private
    
    def update_derived_fields
      if first_visit_date.nil? && last_visit_date.present?
        self.first_visit_date = last_visit_date
      end
      
      if first_visit_date.present? && last_visit_date.present?
        self.days_since_last_visit = (last_visit_date.to_date - first_visit_date.to_date).to_i
      end
    end
  end