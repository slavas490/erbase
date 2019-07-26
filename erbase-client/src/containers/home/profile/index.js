import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ProfileMainPage from './main'

class Profile extends React.Component {
    constructor (props) {
        super(props);

        this.state = {

        };
    }
    
    render = () => {
        const location = this.props.location;
        const user = this.props.user;

        return (
            <div>
                <Switch location={location}>
                    <Route path={user.isActive ? "/profile" : ""} component={() => <ProfileMainPage getUserInfo={this.props.getUserInfo} data={this.state.data} />} />
                </Switch>
            </div>
        )
    }
}

const mapStateToProps = ({ user, router }) => ({
    user,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Profile)
