import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Register() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { name, email, password, confirmPassword } = formData;

	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			console.log("Password don't match");
		} else {
			const newUser = {
				name,
				email,
				password,
			};

			try {
				const config = {
					headers: {
						"Content-Type": "application/json",
					},
				};

				const body = JSON.stringify(newUser);

				const res = await axios.post("api/users", body, config);
				
			} catch (err) {
				console.error(err);
			}
		}
	};

	return (
		<section className="container">
			<h1 className="large text-primary">Sign Up</h1>
			<p className="lead">
				<i className="fas fa-user"></i> Create Your Account
			</p>
			<form className="form" onSubmit={onSubmit}>
				<div className="form-group">
					<input
						type="text"
						placeholder="Name"
						name="name"
						value={name}
						required
						onChange={onChange}
					/>
				</div>
				<div className="form-group">
					<input
						type="email"
						placeholder="Email Address"
						name="email"
						value={email}
						onChange={onChange}
					/>
					<small className="form-text">
						This site uses Gravatar so if you want a profile image, use a
						Gravatar email
					</small>
				</div>
				<div className="form-group">
					<input
						type="password"
						placeholder="Password"
						name="password"
						minLength="6"
						value={password}
						onChange={onChange}
					/>
				</div>
				<div className="form-group">
					<input
						type="password"
						placeholder="Confirm Password"
						name="confirmPassword"
						minLength="6"
						value={confirmPassword}
						onChange={onChange}
					/>
				</div>
				<input type="submit" className="btn btn-primary" value="Register" />
			</form>
			<p className="my-1">
				Already have an account? <Link to="/login">Sign In</Link>
			</p>
		</section>
	);
}

export default Register;
