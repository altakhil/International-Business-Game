<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <DatabaseTest />
    
    <div class="navigation-section">
      <router-link to="/properties" class="nav-button">
        View All Properties Map
      </router-link>
    </div>
    
    <div class="demo-section">
      <router-link to="/board" class="demo-link">
        View Demo Board
      </router-link>
      <router-link to="/properties" class="demo-link">
        View Properties Map
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.hero-title {
  font-size: 64px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 24px;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-section {
  display: flex;
  gap: 40px;
  margin-bottom: 60px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 300px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.card-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #1e3a8a;
}

.card-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.create-game {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.join-game {
  background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%);
}

.demo-section {
  display: flex;
  gap: 20px;
}

.demo-link {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.demo-link:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
