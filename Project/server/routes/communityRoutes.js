const express = require('express');
const CommunityGroup = require('../models/CommunityGroup');
const CommunityDiscussion = require('../models/CommunityDiscussion');
const { protect } = require('../middleware/auth');
const router = express.Router();

const INITIAL_GROUPS = [
  { name: 'Need Help?', description: 'Ask the community for assistance or advice.', icon: '🆘', category: 'Support' },
  { name: 'Build Together', description: 'Collaborate on projects and share resources.', icon: '🛠️', category: 'Collaboration' },
  { name: 'Report Issue', description: 'Report bugs, lost items, or neighborhood issues.', icon: '⚠️', category: 'Alerts' },
  { name: 'Chill Zone', description: 'Relax, share memes, and hang out.', icon: '☕', category: 'Social' },
  { name: 'Your Opinion', description: 'Polls, feedback, and open discussions.', icon: '🗣️', category: 'Feedback' },
  { name: 'Hot Now', description: 'Trending topics and urgent matters.', icon: '🔥', category: 'Trending' }
];

// Get all groups and their discussions
// Get all groups and their discussions
router.get('/groups', async (req, res) => {
  try {
    console.log('GET /groups hit');
    let groups = await CommunityGroup.find().sort({ createdAt: 1 }).lean();
    console.log('Groups found:', groups.length);
    if (groups.length === 0) {
      console.log('Inserting initial groups');
      groups = await CommunityGroup.insertMany(INITIAL_GROUPS);
      console.log('Groups inserted');
    }
    const groupsWithDiscs = [];
    for (let g of groups) {
      console.log('Processing group:', g.name);
      const discussions = await CommunityDiscussion.find({ group: g._id })
        .populate('author', 'name avatar')
        .populate('replies.author', 'name avatar')
        .sort({ createdAt: -1 })
        .lean();
      groupsWithDiscs.push({ ...g, discussions, memberCount: g.members?.length || 0 });
    }
    console.log('Sending response');
    res.json({ groups: groupsWithDiscs });
  } catch (e) {
    console.error('Error in /groups:', e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/groups/:id/join', protect, async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const idx = group.members.indexOf(req.user._id);
    if (idx > -1) group.members.splice(idx, 1);
    else group.members.push(req.user._id);
    await group.save();
    res.json({ members: group.members });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/groups/:id/discussions', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    const disc = await CommunityDiscussion.create({
      group: req.params.id, author: req.user._id, title, content
    });
    const populated = await CommunityDiscussion.findById(disc._id).populate('author', 'name avatar');
    res.status(201).json({ discussion: populated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/discussions/:id/reply', protect, async (req, res) => {
  try {
    const disc = await CommunityDiscussion.findById(req.params.id);
    if (!disc) return res.status(404).json({ error: 'Discussion not found' });
    disc.replies.push({ author: req.user._id, content: req.body.text });
    await disc.save();
    const updated = await CommunityDiscussion.findById(disc._id).populate('replies.author', 'name avatar');
    res.json({ replies: updated.replies });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/discussions/:id/like', protect, async (req, res) => {
  try {
    const disc = await CommunityDiscussion.findById(req.params.id);
    if (!disc) return res.status(404).json({ error: 'Discussion not found' });
    const idx = disc.likes.indexOf(req.user._id);
    if (idx > -1) disc.likes.splice(idx, 1);
    else disc.likes.push(req.user._id);
    await disc.save();
    res.json({ likes: disc.likes.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
