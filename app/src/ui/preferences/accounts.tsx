import * as React from 'react'
import { Account } from '../../models/account'
import { IAvatarUser } from '../../models/avatar'
import { lookupPreferredEmail } from '../../lib/email'
import { assertNever } from '../../lib/fatal-error'
import { Button } from '../lib/button'
import { Row } from '../lib/row'
import { DialogContent } from '../dialog'
import { Avatar } from '../lib/avatar'
import { CallToAction } from '../lib/call-to-action'
import { LinkButton } from '../lib/link-button'

interface IAccountsProps {
  readonly dotComAccount: Account | null
  readonly enterpriseAccount: Account | null

  readonly onDotComSignIn: () => void
  readonly onEnterpriseSignIn: () => void
  readonly onLogout: (account: Account) => void
  readonly onShowUnlockKactusPopup: (account: Account) => void
  readonly onShowCancelKactusPopup: (account: Account) => void
}

enum SignInType {
  DotCom,
  Enterprise,
}

const manageOrgUri = 'http://kactus.io/org/'

export class Accounts extends React.Component<IAccountsProps, {}> {
  public render() {
    return (
      <DialogContent className="accounts-tab">
        <h2>GitHub.com</h2>
        {this.props.dotComAccount
          ? this.renderAccount(this.props.dotComAccount)
          : this.renderSignIn(SignInType.DotCom)}

        <h2>GitHub Enterprise Server</h2>
        {this.props.enterpriseAccount
          ? this.renderAccount(this.props.enterpriseAccount)
          : this.renderSignIn(SignInType.Enterprise)}
      </DialogContent>
    )
  }

  private renderAccount(account: Account) {
    const found = lookupPreferredEmail(account.emails)
    const email = found ? found.email : ''

    const avatarUser: IAvatarUser = {
      name: account.name,
      email: email,
      avatarURL: account.avatarURL,
    }

    const isUnlocked =
      account.unlockedKactus || account.unlockedEnterpriseKactus

    const isUnlockedOrg =
      (account.unlockedKactus && account.unlockedKactusFromOrg) ||
      (account.unlockedEnterpriseKactus &&
        account.unlockedEnterpriseKactusFromOrg)

    return (
      <Row className="account-info">
        <Avatar user={avatarUser} />
        <div className="user-info">
          <div className="name">{account.name}</div>
          <div className="login">@{account.login}</div>
        </div>
        <div className="actions-wrapper">
          {isUnlocked ? (
            <span className="kactus-unlocked">
              ✅ Kactus unlocked.{' '}
              {!isUnlockedOrg ? (
                <LinkButton onClick={this.onCancelSubscription(account)}>
                  Unsubscribe
                </LinkButton>
              ) : (
                <LinkButton uri={manageOrgUri}>Manage</LinkButton>
              )}
            </span>
          ) : (
            <Button
              className="action-button"
              onClick={this.unlockKactus(account)}
            >
              Unlock Kactus
            </Button>
          )}
          <Button onClick={this.logout(account)}>Sign Out</Button>
        </div>
      </Row>
    )
  }

  private onDotComSignIn = () => {
    this.props.onDotComSignIn()
  }

  private onEnterpriseSignIn = () => {
    this.props.onEnterpriseSignIn()
  }

  private renderSignIn(type: SignInType) {
    const signInTitle = 'Sign In'
    switch (type) {
      case SignInType.DotCom: {
        return (
          <CallToAction
            actionTitle={signInTitle}
            onAction={this.onDotComSignIn}
          >
            <div>
              Sign in to your GitHub.com account to access your repositories.
            </div>
          </CallToAction>
        )
      }
      case SignInType.Enterprise:
        return (
          <CallToAction
            actionTitle={signInTitle}
            onAction={this.onEnterpriseSignIn}
          >
            <div>
              If you have a GitHub Enterprise Server account at work, sign in to
              it to get access to your repositories.
            </div>
          </CallToAction>
        )
      default:
        return assertNever(type, `Unknown sign in type: ${type}`)
    }
  }

  private logout = (account: Account) => {
    return () => {
      this.props.onLogout(account)
    }
  }

  private unlockKactus = (account: Account) => {
    return () => {
      this.props.onShowUnlockKactusPopup(account)
    }
  }

  private onCancelSubscription = (account: Account) => {
    return () => {
      this.props.onShowCancelKactusPopup(account)
    }
  }
}
