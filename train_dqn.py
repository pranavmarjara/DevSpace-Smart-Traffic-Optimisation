import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from collections import deque
from traffic_env import IntersectionEnv
import os


class DQNNetwork(nn.Module):
    """Deep Q-Network for traffic light control."""
    
    def __init__(self, state_size: int, action_size: int, hidden_size: int = 128):
        super(DQNNetwork, self).__init__()
        self.fc1 = nn.Linear(state_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, action_size)
        
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)


class DQNAgent:
    """DQN Agent for learning traffic light control."""
    
    def __init__(self, state_size: int, action_size: int, lr: float = 0.001, 
                 gamma: float = 0.99, epsilon_start: float = 1.0, epsilon_end: float = 0.1,
                 replay_buffer_size: int = 10000):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=replay_buffer_size)
        self.epsilon = epsilon_start  # exploration rate
        self.epsilon_min = epsilon_end
        self.epsilon_decay = 0.995
        self.learning_rate = lr
        self.gamma = gamma  # discount factor
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Neural networks
        self.q_network = DQNNetwork(state_size, action_size).to(self.device)
        self.target_network = DQNNetwork(state_size, action_size).to(self.device)
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=lr)
        
        # Update target network
        self.update_target_network()
        
    def update_target_network(self):
        """Copy weights from main network to target network."""
        self.target_network.load_state_dict(self.q_network.state_dict())
        
    def remember(self, state, action, reward, next_state, done):
        """Store experience in replay buffer."""
        self.memory.append((state, action, reward, next_state, done))
        
    def act(self, state):
        """Choose action using epsilon-greedy policy."""
        if np.random.random() <= self.epsilon:
            return random.randrange(self.action_size)
        
        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        q_values = self.q_network(state_tensor)
        return np.argmax(q_values.cpu().data.numpy())
        
    def replay(self, batch_size: int = 32):
        """Train the model on a batch of experiences."""
        if len(self.memory) < batch_size:
            return 0.0
            
        batch = random.sample(self.memory, batch_size)
        states = torch.FloatTensor([e[0] for e in batch]).to(self.device)
        actions = torch.LongTensor([e[1] for e in batch]).to(self.device)
        rewards = torch.FloatTensor([e[2] for e in batch]).to(self.device)
        next_states = torch.FloatTensor([e[3] for e in batch]).to(self.device)
        dones = torch.BoolTensor([e[4] for e in batch]).to(self.device)
        
        current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
        next_q_values = self.target_network(next_states).max(1)[0].detach()
        target_q_values = rewards + (self.gamma * next_q_values * ~dones)
        
        loss = nn.MSELoss()(current_q_values.squeeze(), target_q_values)
        
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
            
        return loss.item()
            
    def save_model(self, filepath: str):
        """Save the trained model."""
        torch.save({
            'q_network_state_dict': self.q_network.state_dict(),
            'target_network_state_dict': self.target_network.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'epsilon': self.epsilon
        }, filepath)
        print(f"Model saved to {filepath}")
        
    def load_model(self, filepath: str):
        """Load a trained model."""
        if os.path.exists(filepath):
            checkpoint = torch.load(filepath, map_location=self.device)
            self.q_network.load_state_dict(checkpoint['q_network_state_dict'])
            self.target_network.load_state_dict(checkpoint['target_network_state_dict'])
            self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            self.epsilon = checkpoint['epsilon']
            print(f"Model loaded from {filepath}")
            return True
        return False


def train_dqn_agent(episodes: int = 500, learning_rate: float = 0.001, 
                    gamma: float = 0.99, epsilon_start: float = 1.0, 
                    epsilon_end: float = 0.1, replay_buffer_size: int = 10000,
                    progress_callback=None):
    """Train the DQN agent on the traffic environment."""
    env = IntersectionEnv()
    agent = DQNAgent(env.state_space_size, env.action_space_size, 
                     lr=learning_rate, gamma=gamma, epsilon_start=epsilon_start,
                     epsilon_end=epsilon_end, replay_buffer_size=replay_buffer_size)
    
    scores = deque(maxlen=100)
    losses = deque(maxlen=100)
    episode_rewards = []  # Track all episode rewards for charting
    
    for episode in range(episodes):
        state = env.reset()
        total_reward = 0
        
        for step in range(200):  # Max steps per episode (matching env max steps)
            action = agent.act(state)
            next_state, reward, done, _ = env.step(int(action))
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            
            if done:
                break
                
        scores.append(total_reward)
        episode_rewards.append(total_reward)
        loss = agent.replay()
        if loss:
            losses.append(loss)
        
        # Update target network every 100 episodes
        if episode % 100 == 0:
            agent.update_target_network()
            
        # Send progress updates every 10 episodes
        if episode % 10 == 0 or episode == episodes - 1:
            avg_score = np.mean(scores)
            avg_loss = np.mean(losses) if losses else 0.0
            
            # Calculate average reward for every 50 episodes for charting
            chart_data = []
            for i in range(0, len(episode_rewards), 50):
                batch_rewards = episode_rewards[i:i+50]
                if batch_rewards:
                    chart_data.append({
                        'episode': i + 25,  # Middle of the range
                        'avg_reward': np.mean(batch_rewards)
                    })
            
            progress_data = {
                'episode': episode + 1,
                'total_episodes': episodes,
                'current_reward': total_reward,
                'avg_reward': avg_score,
                'loss': loss if loss else 0.0,
                'avg_loss': avg_loss,
                'epsilon': agent.epsilon,
                'chart_data': chart_data,
                'completed': episode == episodes - 1
            }
            
            if progress_callback:
                progress_callback(progress_data)
            else:
                print(f"Episode {episode + 1}/{episodes}, Reward: {total_reward:.2f}, Avg Score: {avg_score:.2f}, Loss: {avg_loss:.4f}, Epsilon: {agent.epsilon:.3f}")
    
    # Save the trained model
    os.makedirs('models', exist_ok=True)
    agent.save_model('models/dqn.pt')
    
    if progress_callback:
        progress_callback({
            'episode': episodes,
            'total_episodes': episodes,
            'completed': True,
            'message': 'Training completed! Model saved.'
        })
    else:
        print("Training completed!")
    
    return agent


def train_dqn_agent_generator(episodes: int = 500, learning_rate: float = 0.001, 
                              gamma: float = 0.99, epsilon_start: float = 1.0, 
                              epsilon_end: float = 0.1, replay_buffer_size: int = 10000):
    """Generator version of train_dqn_agent that yields progress updates."""
    env = IntersectionEnv()
    agent = DQNAgent(env.state_space_size, env.action_space_size, 
                     lr=learning_rate, gamma=gamma, epsilon_start=epsilon_start,
                     epsilon_end=epsilon_end, replay_buffer_size=replay_buffer_size)
    
    scores = deque(maxlen=100)
    losses = deque(maxlen=100)
    episode_rewards = []  # Track all episode rewards for charting
    
    for episode in range(episodes):
        state = env.reset()
        total_reward = 0
        
        for step in range(200):  # Max steps per episode (matching env max steps)
            action = agent.act(state)
            next_state, reward, done, _ = env.step(int(action))
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            
            if done:
                break
                
        scores.append(total_reward)
        episode_rewards.append(total_reward)
        loss = agent.replay()
        if loss:
            losses.append(loss)
        
        # Update target network every 100 episodes
        if episode % 100 == 0:
            agent.update_target_network()
            
        # Yield progress updates every 10 episodes
        if episode % 10 == 0 or episode == episodes - 1:
            avg_score = np.mean(scores)
            avg_loss = np.mean(losses) if losses else 0.0
            
            # Calculate average reward for every 50 episodes for charting
            chart_data = []
            for i in range(0, len(episode_rewards), 50):
                batch_rewards = episode_rewards[i:i+50]
                if batch_rewards:
                    chart_data.append({
                        'episode': i + 25,  # Middle of the range
                        'avg_reward': np.mean(batch_rewards)
                    })
            
            progress_data = {
                'episode': episode + 1,
                'total_episodes': episodes,
                'current_reward': total_reward,
                'avg_reward': avg_score,
                'loss': loss if loss else 0.0,
                'avg_loss': avg_loss,
                'epsilon': agent.epsilon,
                'chart_data': chart_data,
                'completed': episode == episodes - 1
            }
            
            yield progress_data
    
    # Save the trained model
    os.makedirs('models', exist_ok=True)
    agent.save_model('models/dqn.pt')
    
    # Final completion message
    yield {
        'episode': episodes,
        'total_episodes': episodes,
        'completed': True,
        'message': 'Training completed! Model saved.'
    }
    
    return agent


def load_trained_agent():
    """Load a pre-trained DQN agent."""
    env = IntersectionEnv()
    agent = DQNAgent(env.state_space_size, env.action_space_size)
    
    if agent.load_model('models/dqn.pt'):
        # Set epsilon to 0 for inference (no exploration)
        agent.epsilon = 0.0
        return agent
    else:
        print("No trained model found. Training a new agent...")
        return train_dqn_agent()


def get_optimized_policy():
    """Get the optimized policy function from trained DQN agent."""
    agent = load_trained_agent()
    
    def policy_func(state):
        return agent.act(state)
    
    return policy_func


if __name__ == "__main__":
    print("Training DQN agent for traffic light optimization...")
    train_dqn_agent(episodes=500)  # Reduced for faster training