const express = require('express');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// Body-parser 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 블로그 포스트 API
app.get('/api/posts', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading posts data');
    }
    res.json(JSON.parse(data));
  });
});

function getPosts() {
  try {
    const postsData = fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf8');
    return JSON.parse(postsData);
  } catch (error) {
    console.error("Error reading posts data:", error);
    return [];
  }
}

// 포스트 수를 반환하는 API
app.get('/api/posts/count', (req, res) => {
  const posts = getPosts();
  res.json({ count: posts.length });
});

// 개별 포스트 페이지
app.get('/post/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post.html'));
});

// 포스트 작성 페이지
app.get('/write', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'write.html'));
});

// 포스트 저장
app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = {
    id: Date.now().toString(),
    title,
    content
  };

  fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading posts data');
    }
    const posts = JSON.parse(data);
    posts.push(newPost);
    fs.writeFile(path.join(__dirname, 'data', 'posts.json'), JSON.stringify(posts, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving post');
      }
      res.redirect('/');
    });
  });
});

// 포스트 내용 HTML 변환
app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading posts data');
    }
    const posts = JSON.parse(data);
    const post = posts.find(p => p.id === id);
    if (post) {
      res.json({
        ...post,
        content: marked(post.content)
      });
    } else {
      res.status(404).send('Post not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
