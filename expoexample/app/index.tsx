import { Redirect } from 'expo-router';
import { FC } from 'react';

const App: FC = () => {
  return <Redirect href="/(tabs)" />;
};

export default App;
