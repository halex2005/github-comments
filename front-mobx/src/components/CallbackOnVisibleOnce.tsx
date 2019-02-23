import React, { ReactNode } from 'react';

interface IProps {
  trigger: any
}

export class CallbackOnVisibleOnce extends React.Component<IProps> {
  componentDidMount() {
    document.addEventListener('scroll', this.checkInView)
    this.checkInView()
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.checkInView)
  }

  checkInView = () => {
    const scrollTrigger = this.refs.scrollTrigger as HTMLElement
    if (scrollTrigger.getBoundingClientRect().bottom <= window.innerHeight) {
      document.removeEventListener('scroll', this.checkInView)
      this.triggerBottomIsReached();
    }
  }

  triggerBottomIsReached() {
    this.props.trigger && this.props.trigger()
  }

  render(): ReactNode {
    return (
      <div ref='scrollTrigger'>
        {this.props.children}
      </div>
    )
  }
}
