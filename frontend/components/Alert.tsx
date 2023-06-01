interface AlertProps {
	message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
	return <div className="alert alert-danger">{message}</div>;
};

export default Alert;
