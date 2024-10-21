// frontend/src/components/Navigation/Navigation.jsx

import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import LoginFormModal from '../LoginFormModal';
import OpenModalButton from '../OpenModalButton';
import SignupFormModal from '../SignupFormModal';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
	const sessionUser = useSelector((state) => state.session.user);

	let sessionLinks;
	if (sessionUser) {
		sessionLinks = (
			<li>
				<ProfileButton user={sessionUser} />
			</li>
		);
	} else {
		sessionLinks = (
			<>
				<li>
					<OpenModalButton
						buttonText='Log In'
						modalComponent={<LoginFormModal />}
					/>
				</li>
				<li>
					<OpenModalButton
						buttonText='Sign Up'
						modalComponent={<SignupFormModal />}
					/>
				</li>
			</>
		);
	}

	return (
		<ul>
			<li>
				<NavLink to='/'>Home</NavLink>
			</li>
			{isLoaded && sessionLinks}
		</ul>
	);
}

export default Navigation;
