import React, { PureComponent } from 'react';
// import tinycolor, { ColorInput } from 'tinycolor2';

import { Threshold, BasicGaugeColor } from '../../types';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { PanelOptionsGroup } from '../PanelOptionsGroup/PanelOptionsGroup';
import { colors } from '../../utils';

export interface Props {
  thresholds: Threshold[];
  onChange: (thresholds: Threshold[]) => void;
}

interface State {
  thresholds: Threshold[];
  baseColor: string;
}

export class ThresholdsEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const thresholds: Threshold[] =
      props.thresholds.length > 0 ? props.thresholds : [{ index: 0, value: -Infinity, color: colors[0] }];
    this.state = { thresholds, baseColor: BasicGaugeColor.Green };
  }

  onAddThreshold = (index: number) => {
    const { thresholds } = this.state;
    const maxValue = 100;
    const minValue = 0;

    if (index === 0) {
      return;
    }

    const newThresholds = thresholds.map(threshold => {
      if (threshold.index >= index) {
        const index = threshold.index + 1;
        threshold = {
          ...threshold,
          index,
          color: colors[index],
        };
      }
      return threshold;
    });

    // Setting value to a value between the previous thresholds
    const beforeThreshold = newThresholds.filter(threshold => threshold.index === index - 1)[0];
    const afterThreshold = newThresholds.filter(threshold => threshold.index === index + 1)[0];
    const beforeThresholdValue = beforeThreshold !== undefined ? Math.max(beforeThreshold.value, minValue) : minValue;
    const afterThresholdValue = afterThreshold !== undefined ? Math.min(afterThreshold.value, maxValue) : maxValue;
    const value = afterThresholdValue - (afterThresholdValue - beforeThresholdValue) / 2;

    // Set a color
    const color = colors[index];

    this.setState(
      {
        thresholds: this.sortThresholds([
          ...newThresholds,
          {
            index,
            value: value as number,
            color,
          },
        ]),
      },
      () => this.updateGauge()
    );
  };

  onRemoveThreshold = (threshold: Threshold) => {
    this.setState(
      prevState => ({ thresholds: prevState.thresholds.filter(t => t !== threshold) }),
      () => this.updateGauge()
    );
  };

  onChangeThresholdValue = (event: any, threshold: Threshold) => {
    const { thresholds } = this.state;

    const newThresholds = thresholds.map(t => {
      if (t === threshold) {
        t = { ...t, value: event.target.value };
      }

      return t;
    });

    this.setState({ thresholds: newThresholds });
  };

  onChangeThresholdColor = (threshold: Threshold, color: string) => {
    const { thresholds } = this.state;

    const newThresholds = thresholds.map(t => {
      if (t === threshold) {
        t = { ...t, color: color };
      }

      return t;
    });

    this.setState(
      {
        thresholds: newThresholds,
      },
      () => this.updateGauge()
    );
  };

  onChangeBaseColor = (color: string) => this.props.onChange(this.state.thresholds);
  onBlur = () => {
    this.setState(prevState => ({ thresholds: this.sortThresholds(prevState.thresholds) }));

    this.updateGauge();
  };

  updateGauge = () => {
    this.props.onChange(this.state.thresholds);
  };

  sortThresholds = (thresholds: Threshold[]) => {
    return thresholds.sort((t1, t2) => {
      return t2.value - t1.value;
    });
  };

  renderThresholds() {
    const { thresholds } = this.state;

    return thresholds.map((threshold, index) => {
      return (
        <div className="threshold-row" key={`${threshold.index}-${index}`}>
          <div className="threshold-row-inner">
            <div className="threshold-row-color">
              {threshold.color && (
                <div className="threshold-row-color-inner">
                  <ColorPicker
                    color={threshold.color}
                    onChange={color => this.onChangeThresholdColor(threshold, color)}
                  />
                </div>
              )}
            </div>
            <input
              className="threshold-row-input"
              type="text"
              onChange={event => this.onChangeThresholdValue(event, threshold)}
              value={threshold.value}
              onBlur={this.onBlur}
            />
            <div onClick={() => this.onRemoveThreshold(threshold)} className="threshold-row-remove">
              <i className="fa fa-times" />
            </div>
          </div>
        </div>
      );
    });
  }

  renderIndicator() {
    const { thresholds } = this.state;

    return thresholds.map((t, i) => {
      return (
        <div key={`${t.value}-${i}`} className="indicator-section">
          <div onClick={() => this.onAddThreshold(t.index + 1)} style={{ height: '50%', backgroundColor: t.color }} />
          <div onClick={() => this.onAddThreshold(t.index)} style={{ height: '50%', backgroundColor: t.color }} />
        </div>
      );
    });
  }

  renderBaseIndicator() {
    return (
      <div className="indicator-section" style={{ height: '100%' }}>
        <div
          onClick={() => this.onAddThreshold(0)}
          style={{ height: '100%', backgroundColor: BasicGaugeColor.Green }}
        />
      </div>
    );
  }

  renderBase() {
    const baseColor = BasicGaugeColor.Green;

    return (
      <div className="threshold-row threshold-row-base">
        <div className="threshold-row-inner threshold-row-inner--base">
          <div className="threshold-row-color">
            <div className="threshold-row-color-inner">
              <ColorPicker color={baseColor} onChange={color => this.onChangeBaseColor(color)} />
            </div>
          </div>
          <div className="threshold-row-label">Base</div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <PanelOptionsGroup title="Thresholds">
        <div className="thresholds">
          <div className="color-indicators">
            {this.renderIndicator()}
            {this.renderBaseIndicator()}
          </div>
          <div className="threshold-rows">
            {this.renderThresholds()}
            {this.renderBase()}
          </div>
        </div>
      </PanelOptionsGroup>
    );
  }
}
