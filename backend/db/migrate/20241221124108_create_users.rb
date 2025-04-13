class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :visitor_id, null: false
      t.string :ip
      t.string :country
      t.string :device
      t.string :cookie_token

      t.timestamps
    end
    
    add_index :users, :visitor_id, unique: true
    add_index :users, :cookie_token
  end
end