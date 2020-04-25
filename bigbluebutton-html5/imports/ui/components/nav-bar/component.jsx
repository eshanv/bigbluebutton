import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import cx from 'classnames';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import Button from '../button/component';
import RecordingIndicator from './recording-indicator/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import SettingsDropdownContainer from './settings-dropdown/container';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';

const white = "#fff";


const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  toggleUserListAria: {
    id: 'app.navBar.toggleUserList.ariaLabel',
    description: 'description of the lists inside the userlist',
  },
  newMessages: {
    id: 'app.navBar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
};

function Iframe(props) {
   return (
      <div
         dangerouslySetInnerHTML={{ __html: newthisframe(props.sessiontoken) }}
         />
   ); 
}


function newthisframe(props){
  const currentUser  = Users.findOne({ userId: Auth.userID }, { fields: { role: 1, logintTime:1 }});
   let url = 'https://baax.online/tokens.php?session='+ JSON.stringify(props).replace(/\"/g,'');
   url = url + "&role="+ JSON.stringify(currentUser.role).replace(/\"/g,'');
   
   let myframe = '<iframe src="'+url+'" scrolling="no" frameborder="no" title="" allow=""autoplay; geolocation; midi; vr; payment; " style="border:0; border-radius:0; overflow:hidden; " sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>';
   
   return myframe;
   
}


class NavBar extends PureComponent {
  static handleToggleUserList() {
    Session.set(
      'openPanel',
      Session.get('openPanel') !== ''
        ? ''
        : 'userlist',
    );
    Session.set('idChatOpen', '');
  }
   
   rendermyFrame(){
      const dragwrapClass = 'draggamewrap';
      return (
      <div className={dragwrapClass}>
         <Iframe sessiontoken={Auth.meetingID} allow="autoplay" />
         </div>
         );
      
   }

  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
    } = this.props;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('bbb_outside_toggle_recording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      hasUnreadMessages,
      isExpanded,
      intl,
      shortcuts: TOGGLE_USERLIST_AK,
      mountModal,
      presentationTitle,
      amIModerator,
    } = this.props;


    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasUnreadMessages;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasUnreadMessages ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    return (
      <div className={styles.navbar}>
        <div className={styles.top}>
          <div className={styles.left}>
            <Button
              data-test="userListToggleButton"
              onClick={NavBar.handleToggleUserList}
              ghost
              circle
              hideLabel
              label={intl.formatMessage(intlMessages.toggleUserListLabel)}
              aria-label={ariaLabel}
              icon="user"
              className={cx(toggleBtnClasses)}
              aria-expanded={isExpanded}
              accessKey={TOGGLE_USERLIST_AK}
            />
             <img src='logo_new.png' alt="Logo" style={{ maxWidth: '120px '}} />
              
          </div>
          <div className={styles.center}>
             {this.rendermyFrame()}
            
          </div>
          <div className={styles.right}>
             <h1 className={styles.presentationTitle}>{presentationTitle}</h1>

            <RecordingIndicator
              mountModal={mountModal}
              amIModerator={amIModerator}
            />
            <SettingsDropdownContainer amIModerator={amIModerator} />
          </div>
        </div>
        <div className={styles.bottom}>
          <TalkingIndicatorContainer amIModerator={amIModerator} />
        </div>
          
         
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');
