const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['post', 'event', 'group_buy'], default: 'post' },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    // Event-specific
    eventDate: { type: String, default: '' },
    eventLocation: { type: String, default: '' },
    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityPost', communityPostSchema);
