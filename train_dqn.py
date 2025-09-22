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
    
    def __init__(self, state_size: int, action_size: int, lr: float = 0.001):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=10000)
        self.epsilon = 1.0  # exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = lr
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
        target_q_values = rewards + (0.99 * next_q_values * ~dones)
        
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


def train_dqn_agent(episodes: int = 500):
    """Train the DQN agent on the traffic environment."""
    env = IntersectionEnv()
    agent = DQNAgent(env.state_space_size, env.action_space_size)
    
    scores = deque(maxlen=100)
    losses = deque(maxlen=100)
    
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
        loss = agent.replay()
        if loss:
            losses.append(loss)
        
        # Update target network every 100 episodes
        if episode % 100 == 0:
            agent.update_target_network()
            
        # Print training loss and average reward per 50 episodes
        if episode % 50 == 0 and episode > 0:
            avg_score = np.mean(scores)
            avg_loss = np.mean(losses) if losses else 0.0
            print(f"Episode {episode}, Average Score: {avg_score:.2f}, Average Loss: {avg_loss:.4f}, Epsilon: {agent.epsilon:.3f}")
    
    # Save the trained model
    os.makedirs('models', exist_ok=True)
    agent.save_model('models/dqn.pt')
    print("Training completed!")
    
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