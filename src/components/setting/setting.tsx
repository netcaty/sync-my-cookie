import React, { Component } from 'react';
import './setting.scss';
const style = require('./setting.module.scss');

import { Modal } from 'antd';
import { Button, Collapse, Icon, Input, InputNumber, message, Select, Switch, Tooltip } from 'antd';

import { KevastGist } from 'kevast-gist';
import { setting, refresh, activeDomains, gist, RefreshConfiguration } from '../../utils/store';

interface Prop {
  onSet: () => void;
}

export interface State {
  token: string;
  password: string;
  gistId?: string;
  filename?: string;
  loading: boolean;
  importModal: boolean;
  importValue: string;
  refreshEnabled: boolean;
  refreshInterval: number;
  availableDomains: string[];
  activeRefreshDomains: string[];
}

class Setting extends Component<Prop, State> {
  public constructor(props: Prop) {
    super(props);
    this.state = {
      token: '',
      password: '',
      loading: false,
      importModal: false,
      importValue: '',
      refreshEnabled: false,
      refreshInterval: 60,
      availableDomains: [],
      activeRefreshDomains: [],
    };
  }
  public render() {
    const domainOptions = this.state.availableDomains.map(domain => (
      <Select.Option key={domain}>{domain}</Select.Option>
    ));

    return (
      <div className={style.wrapper}>
        <img className={style.logo} src='/icon/icon128.png'/>
        <Input
          name='token'
          placeholder='GitHub Access Token'
          prefix={<Icon type='github' style={{ color: 'rgba(0,0,0,.25)' }} />}
          allowClear={true}
          onChange={this.handleChange}
          value={this.state.token}
          className={style.input}
        />
        <Tooltip title='NOT your GitHub password, but a key to encrypt your cookies.' placement='topLeft'>
          <Input
            name='password'
            placeholder='Password'
            prefix={<Icon type='key' style={{ color: 'rgba(0,0,0,.25)' }} />}
            allowClear={true}
            onChange={this.handleChange}
            value={this.state.password}
            className={style.input}
          />
        </Tooltip>
        <Collapse bordered={false} className={style.collapse}>
          <Collapse.Panel header='Optional' key='2' className={style.panel}>
            <Input
              name='gistId'
              placeholder='Gist ID'
              prefix={<Icon type='fork' style={{ color: 'rgba(0,0,0,.25)' }} />}
              allowClear={true}
              onChange={this.handleChange}
              value={this.state.gistId}
              className={style.input}
            />
            <Input
              name='filename'
              placeholder='File Name'
              prefix={<Icon type='file' style={{ color: 'rgba(0,0,0,.25)' }} />}
              allowClear={true}
              onChange={this.handleChange}
              value={this.state.filename}
              className={[style.input, style.filename].join(' ')}
            />
            <div className={style.refresh}>
              <div className={style.refreshRow}>
                <span className={style.label}>Auto Refresh (Keep Active)</span>
                <Switch
                  checked={this.state.refreshEnabled}
                  onChange={this.handleRefreshEnabledChange}
                />
              </div>
              {this.state.refreshEnabled && (
                <>
                  <div className={style.refreshRow}>
                    <span className={style.label}>Interval (minutes)</span>
                    <InputNumber
                      min={1}
                      max={1440}
                      value={this.state.refreshInterval}
                      onChange={this.handleRefreshIntervalChange}
                      className={style.intervalInput}
                    />
                  </div>
                  <div className={style.refreshRow}>
                    <span className={style.label}>Domains to Keep Active</span>
                    <Select
                      mode='multiple'
                      className={style.domainSelect}
                      placeholder='Select domains'
                      value={this.state.activeRefreshDomains}
                      onChange={this.handleActiveDomainsChange}
                      maxTagCount={3}
                    >
                      {domainOptions}
                    </Select>
                  </div>
                </>
              )}
            </div>
          </Collapse.Panel>
        </Collapse>
        <Button
          type='primary'
          disabled={!this.state.token || !this.state.password}
          onClick={this.handleClick}
          block={true}
          icon='setting'
          loading={this.state.loading}
        >
          Set
        </Button>
        <div className={style.port}>
          <Button
            type='primary'
            icon='logout'
            className={style.button}
            onClick={this.handleExport}
            disabled={!this.state.token ||
              !this.state.password ||
              !this.state.gistId ||
              !this.state.filename}
          >
            Export
          </Button>
          <Button
            icon='login'
            className={style.button}
            onClick={this.handleImportOpen}
          >
            Import
          </Button>
          <Modal
            title='Import Setting'
            visible={this.state.importModal}
            onOk={this.handleImport}
            onCancel={this.handleImportClose}
          >
            <Input
              placeholder='Paste here'
              onChange={this.handleImportChange}
            />
          </Modal>
        </div>
      </div>
    );
  }
  public async componentDidMount() {
    const refreshConfig = await refresh.get();
    const activeRefreshDomains = await activeDomains.get();
    let availableDomains: string[] = [];
    try {
      const ready = await gist.init();
      if (ready) {
        availableDomains = await gist.getDomainList();
      }
    } catch (err) {
      console.error('Failed to load domain list:', err);
    }
    this.setState({
      token: await setting.get('token') || '',
      password: await setting.get('password') || '',
      gistId: await setting.get('gistId') || '',
      filename: await setting.get('filename') || '',
      refreshEnabled: refreshConfig.enabled,
      refreshInterval: refreshConfig.interval,
      availableDomains,
      activeRefreshDomains,
    });
  }
  private handleImport = async () => {
    let imported: any;
    try {
      imported = JSON.parse(atob(this.state.importValue));
    } catch (err) {
      message.error('Fail to import: Invalid data');
      return;
    }
    this.setState({
      token: imported.token,
      password: imported.password,
      gistId: imported.gistId,
      filename: imported.filename,
    });
    message.success('Imported! Click "Set" to finish setting');
    this.handleImportClose();
  }
  private handleImportClose = () => {
    this.setState({importModal: false});
  }
  private handleImportOpen = () => {
    this.setState({importModal: true});
  }
  private handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      importValue: e.currentTarget.value,
    });
  }
  private handleExport = async () => {
    if (this.state.token &&
      this.state.password &&
      this.state.gistId &&
      this.state.filename
      ) {
        const base64 = btoa(JSON.stringify({
          token: this.state.token,
          password: this.state.password,
          gistId: this.state.gistId,
          filename: this.state.filename,
        }));
        const nav = navigator as any;
        await nav.clipboard.writeText(base64);
        message.success('Exported to your clipboard!');
      }
  }
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const value = target.value as any;
    const name = target.name;
    this.setState({
      [name]: value,
    } as Pick<State, keyof State>);
  }
  private handleRefreshEnabledChange = async (checked: boolean) => {
    this.setState({ refreshEnabled: checked });
    await refresh.set({ enabled: checked, interval: this.state.refreshInterval });
  }
  private handleRefreshIntervalChange = async (value: number | undefined) => {
    if (value !== undefined && value !== null) {
      this.setState({ refreshInterval: value });
      await refresh.set({ enabled: this.state.refreshEnabled, interval: value });
    }
  }
  private handleActiveDomainsChange = async (domains: string[]) => {
    this.setState({ activeRefreshDomains: domains });
    await activeDomains.set(domains);
  }
  private handleClick = async () => {
    this.setState({
      loading: true,
    });
    const kevastGist = new KevastGist(this.state.token, this.state.gistId, this.state.filename);
    try {
      await kevastGist.init();
    } catch (err) {
      Modal.error({
        title: 'Fail',
        content: err.message,
      });
      return;
    }
    await new Promise((resolve) => chrome.storage.local.clear(resolve));
    await setting.set({
      token: this.state.token,
      password: this.state.password,
      gistId: await kevastGist.getGistId(),
      filename: await kevastGist.getFilename(),
    });
    await refresh.set({ enabled: this.state.refreshEnabled, interval: this.state.refreshInterval });
    this.props.onSet();
  }
}

export default Setting;
