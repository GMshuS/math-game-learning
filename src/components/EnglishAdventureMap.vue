<template>
  <div class="english-adventure-map">
    <GameTutorial
      v-if="showTutorial"
      title="🏰 英语冒险世界玩法说明"
      :steps="adventureTutorialSteps"
      @close="closeTutorial"
    />

    <div class="map-header">
      <h2>🏰 英语冒险世界</h2>
      <div class="header-actions">
        <button class="btn-help" @click="showTutorial = true">❓ 玩法说明</button>
        <button class="btn-back" @click="back">← 返回</button>
      </div>
    </div>

    <!-- Phaser 游戏容器 -->
    <div ref="gameContainer" class="phaser-container" />

    <!-- 操作提示 -->
    <div class="map-hint">
      <p>点击已解锁的区域开始语法冒险！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import EnglishWorldMapScene from '../scenes/EnglishWorldMapScene';
import GameTutorial from './GameTutorial.vue';

const props = defineProps({
  unlockedRegions: {
    type: Array,
    default: () => ['region_1']
  },
  currentRegionId: {
    type: String,
    default: 'region_1'
  }
});

const emit = defineEmits(['regionSelect', 'back']);

// 玩法说明
const showTutorial = ref(false);

const closeTutorial = () => {
  showTutorial.value = false;
};

const adventureTutorialSteps = [
  {
    title: '冒险世界',
    description: '英语冒险世界包含多个区域，每个区域对应不同的语法知识点和挑战内容。'
  },
  {
    title: '区域解锁',
    description: '区域按顺序解锁，完成前一个区域的挑战即可解锁下一个区域。已解锁的区域在地图上高亮显示。'
  },
  {
    title: '点选冒险',
    description: '点击已解锁的区域图标，即可进入该区域的语法冒险，开始答题闯关。'
  },
  {
    title: '冒险流程',
    description: '进入区域后完成一系列的语法挑战，积累积分和奖励。每个区域包含多个关卡等你征服！'
  }
];

const gameContainer = ref(null);
let game = null;

onMounted(() => {
  if (gameContainer.value) {
    const config = {
      type: Phaser.AUTO,
      parent: gameContainer.value,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a3e',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [] // 不传场景，稍后手动添加启动，避免重复初始化
    };

    game = new Phaser.Game(config);

    // 等 game 就绪后添加场景并传递参数
    game.events.on('ready', () => {
      game.scene.add('EnglishWorldMapScene', EnglishWorldMapScene, true, {
        unlockedRegions: props.unlockedRegions,
        currentRegionId: props.currentRegionId,
        onRegionSelect: (region) => {
          emit('regionSelect', region);
        }
      });
    });
  }
});

onUnmounted(() => {
  if (game) {
    game.destroy(true);
    game = null;
  }
});

const back = () => {
  emit('back');
};
</script>

<style scoped>
.english-adventure-map {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  color: #fff;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 1rem;
}

.map-header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-back,
.btn-help {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
}

.btn-help {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-help:hover {
  background: rgba(102, 126, 234, 0.5);
}

.phaser-container {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.map-hint {
  margin-top: 1rem;
  text-align: center;
  opacity: 0.8;
}

.map-hint p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
