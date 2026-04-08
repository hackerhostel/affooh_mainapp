import AnimatedLoader from '../components/AnimatedLoader.jsx';

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AnimatedLoader 
        size="large"
        message="Loading..."
        showMessage={true}
        animationType="jumpSlide"
      />
    </div>
  );
};

export default LoadingPage;