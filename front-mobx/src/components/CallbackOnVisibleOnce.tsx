import React from 'react'
import { boundMethod } from 'autobind-decorator'

interface IProps {
  trigger: any;
}

export class CallbackOnVisibleOnce extends React.Component<IProps> {
  private scrollTriggerRef = React.createRef<HTMLDivElement>()

  public componentDidMount() {
    document.addEventListener('scroll', this.checkInView)
    this.checkInView()
  }

  public componentWillUnmount() {
    document.removeEventListener('scroll', this.checkInView)
  }

  public render() {
    return (
      <div ref={this.scrollTriggerRef}>
        {this.props.children}
      </div>
    )
  }

  @boundMethod
  private checkInView() {
    const scrollTrigger = this.scrollTriggerRef.current
    if (scrollTrigger && scrollTrigger.getBoundingClientRect().bottom <= window.innerHeight) {
      document.removeEventListener('scroll', this.checkInView)
      this.triggerBottomIsReached()
    }
  }

  private triggerBottomIsReached() {
    if (this.props.trigger) {
      this.props.trigger()
    }
  }
}
