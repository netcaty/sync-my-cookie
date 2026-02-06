import React, { Component } from 'react';
import { Collapse, Icon, InputNumber, Select, Switch } from 'antd';
import { activeDomains, refresh } from '../../utils/store';
import './refresh-config.scss';

interface Prop {
  domains: string[];
}

interface State {
  enabled: boolean;
  interval: number;
  activeDomains: string[];
}

class RefreshConfig extends Component<Prop, State> {
  public constructor(props: Prop) {
    super(props);
    this.state = {
      enabled: false,
      interval: 60,
      activeDomains: [],
    };
  }

  public async componentDidMount() {
    const refreshConfig = await refresh.get();
    const activeRefreshDomains = await activeDomains.get();
    this.setState({
      enabled: refreshConfig.enabled,
      interval: refreshConfig.interval,
      activeDomains: activeRefreshDomains,
    });
  }

  public render() {
    const domainOptions = this.props.domains.map((domain) => (
      <Select.Option key={domain}>{domain}</Select.Option>
    ));

    return (
      <div className='refresh-config'>
        <Collapse bordered={false}>
          <Collapse.Panel
            header={
              <div className='refresh-header'>
                <span>
                  <Icon type='clock-circle' style={{ marginRight: 8 }} />
                  自动刷新cookie
                </span>
                <Switch
                  size='small'
                  checked={this.state.enabled}
                  onChange={this.handleEnabledChange}
                />
              </div>
            }
            key='refresh'
          >
            {this.state.enabled && (
              <div className='refresh-content'>
                <div className='refresh-row'>
                  <span className='label'>刷新间隔（分钟）</span>
                  <InputNumber
                    min={1}
                    max={1440}
                    value={this.state.interval}
                    onChange={this.handleIntervalChange}
                  />
                </div>
                <div className='refresh-row'>
                  <span className='label'>需要刷新的域名</span>
                  <Select
                    mode='multiple'
                    className='domain-select'
                    placeholder='选择域名'
                    value={this.state.activeDomains}
                    onChange={this.handleDomainsChange}
                    maxTagCount={3}
                  >
                    {domainOptions}
                  </Select>
                </div>
              </div>
            )}
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }

  private handleEnabledChange = async (checked: boolean) => {
    this.setState({ enabled: checked });
    await refresh.set({ enabled: checked, interval: this.state.interval });
  }

  private handleIntervalChange = async (value: number | undefined) => {
    if (value !== undefined && value !== null) {
      this.setState({ interval: value });
      await refresh.set({ enabled: this.state.enabled, interval: value });
    }
  }

  private handleDomainsChange = async (domains: string[]) => {
    this.setState({ activeDomains: domains });
    await activeDomains.set(domains);
  }
}

export default RefreshConfig;
