class CreateVideos < ActiveRecord::Migration[7.2]
  def change
    create_table :videos do |t|
      t.string :title
      t.string :youtube_id
      t.text :subtitles

      t.timestamps
    end
  end
end
