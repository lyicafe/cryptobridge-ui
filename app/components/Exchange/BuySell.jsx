import React from "react";
import {PropTypes} from "react";
import classNames from "classnames";
import utils from "common/utils";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import PriceText from "../Utility/PriceText";
import AssetName from "../Utility/AssetName";
import SimpleDepositWithdraw from "../Dashboard/SimpleDepositWithdraw";
import SimpleDepositBlocktradesBridge from "../Dashboard/SimpleDepositBlocktradesBridge";
import {Asset} from "common/MarketClasses";
import ExchangeInput from "./ExchangeInput";
import assetUtils from "common/asset_utils";
import Icon from "../Icon/Icon";

class BuySell extends React.Component {

    static propTypes = {
        balance: ChainTypes.ChainObject,
        type: PropTypes.string,
        amountChange: PropTypes.func.isRequired,
        priceChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    };

    static defaultProps = {
        type: "bid"
    };

    shouldComponentUpdate(nextProps) {
        return (
                nextProps.amount !== this.props.amount ||
                nextProps.onBorrow !== this.props.onBorrow ||
                nextProps.total !== this.props.total ||
                nextProps.currentPrice !== this.props.currentPrice ||
                nextProps.price !== this.props.price ||
                nextProps.balance !== this.props.balance ||
                nextProps.account !== this.props.account ||
                nextProps.className !== this.props.className ||
                (nextProps.fee && this.props.fee ? nextProps.fee.ne(this.props.fee) : false) ||
                nextProps.isPredictionMarket !== this.props.isPredictionMarket ||
                nextProps.feeAsset !== this.props.feeAsset ||
                nextProps.isOpen !== this.props.isOpen ||
                nextProps.hasFeeBalance !== this.props.hasFeeBalance
            );
    }

    _addBalance(balance) {
        if (this.props.type === "bid") {
            this.props.totalChange({target: {value: balance.getAmount({real: true}).toString()}});
        } else {
            this.props.amountChange({target: {value: balance.getAmount({real: true}).toString()}});
        }
    }

    _setPrice(price) {
        this.props.priceChange({target: {value: price.toString()}});
    }

    _onDeposit(e) {
        e.preventDefault();
        this.refs.deposit_modal.show();
    }

    _onBuy(e) {
        e.preventDefault();
        this.refs.bridge_modal.show();
    }

    render() {
        let {type, quote, base, amountChange, fee, isPredictionMarket,
            priceChange, onSubmit, balance, totalChange,
            balancePrecision, currentPrice, currentPriceObject,
            feeAsset, feeAssets, hasFeeBalance, backedCoin} = this.props;
        let amount, price, total;
        let caret = this.props.isOpen ? <span>&#9660;</span> : <span>&#9650;</span>;

        if (this.props.amount) amount = this.props.amount;
        if (this.props.price) price = this.props.price;
        if (this.props.total) total = this.props.total;

        let balanceAmount = new Asset({amount: balance ? balance.get("balance") : 0, precision: balancePrecision, asset_id: this.props.balanceId});

        const maxBaseMarketFee = new Asset({
            amount: base.getIn(["options", "max_market_fee"]),
            asset_id: base.get("asset_id"),
            precision: base.get("precision")
        });
        const maxQuoteMarketFee = new Asset({
            amount: quote.getIn(["options", "max_market_fee"]),
            asset_id: quote.get("asset_id"),
            precision: quote.get("precision")
        });
        const quoteFee = !amount ? 0 : Math.min(maxQuoteMarketFee.getAmount({real: true}), amount * quote.getIn(["options", "market_fee_percent"]) / 10000);
        const baseFee = !amount ? 0 : Math.min(maxBaseMarketFee.getAmount({real: true}), (total || 0) * base.getIn(["options", "market_fee_percent"]) / 10000);
        const baseFlagBooleans = assetUtils.getFlagBooleans(base.getIn(["options", "flags"]), base.has("bitasset_data_id"));
        const quoteFlagBooleans = assetUtils.getFlagBooleans(quote.getIn(["options", "flags"]), quote.has("bitasset_data_id"));


        const hasMarketFee = baseFlagBooleans["charge_market_fee"] || quoteFlagBooleans["charge_market_fee"];
        var baseMarketFee = baseFlagBooleans["charge_market_fee"] ? (
            <div className="grid-block no-padding buy-sell-row">
                <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                    <Translate content="explorer.asset.summary.market_fee" />:
                </div>
                <div className="grid-block small-5 no-margin no-overflow buy-sell-input">
                    <input disabled type="text" id="baseMarketFee" value={baseFee} autoComplete="off"/>
                </div>
                <div className="grid-block small-4 no-margin no-overflow buy-sell-box">
                    <AssetName noTip name={base.get("symbol")} />
                    <span
                        data-tip={counterpart.translate(
                            "tooltip.market_fee",
                            {
                                percent: base.getIn(["options", "market_fee_percent"]) / 100,
                                asset: base.get("symbol")
                            }
                        )
                        }
                        className="inline-block tooltip"
                    >
                        &nbsp;<Icon style={{position: "relative", top: 3}} name="question-circle" />
                    </span>
                </div>
            </div>
        ) : hasMarketFee ?
        <div className="grid-block no-padding buy-sell-row">
            <div style={{visibility: "hidden"}} className="grid-block small-3 no-margin no-overflow buy-sell-label">
                <Translate content="explorer.asset.summary.market_fee" />:
            </div>
        </div> : null;
        var quoteMarketFee = quoteFlagBooleans["charge_market_fee"] ? (
            <div className="grid-block no-padding buy-sell-row">
                <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                    <Translate content="explorer.asset.summary.market_fee" />:
                </div>
                <div className="grid-block small-5 no-margin no-overflow buy-sell-input">
                    <input disabled type="text" id="baseMarketFee" value={quoteFee} autoComplete="off"/>
                </div>
                <div className="grid-block small-4 no-margin no-overflow buy-sell-box">
                    <AssetName noTip name={quote.get("symbol")} />
                    <span
                        data-tip={counterpart.translate(
                            "tooltip.market_fee",
                            {
                                percent: quote.getIn(["options", "market_fee_percent"]) / 100,
                                asset: quote.get("symbol")
                            }
                        )
                        }
                        className="inline-block tooltip"
                    >
                        &nbsp;<Icon style={{position: "relative", top: 3}} name="question-circle" />
                    </span>
                </div>
            </div>
        ) : hasMarketFee ?
        <div className="grid-block no-padding buy-sell-row">
            <div style={{visibility: "hidden"}} className="grid-block small-3 no-margin no-overflow buy-sell-label">
                <Translate content="explorer.asset.summary.market_fee" />:
            </div>
        </div> : null;

        // if (!balanceAmount) {
        //     balanceAmount = 0;
        // }
        const isBid = type === "bid";
        const realBalanceAmount = balanceAmount.getAmount({real: true});
        const showFeeAmount = amount > 0 && price > 0;

        let marketFee = isBid && quoteMarketFee ? quoteMarketFee : !isBid && baseMarketFee ? baseMarketFee : null;
        let hasBalance = isBid ? realBalanceAmount >= parseFloat(total) : realBalanceAmount >= parseFloat(amount);

        let buttonText = isPredictionMarket ? counterpart.translate("exchange.short") : isBid ? counterpart.translate("exchange.buy") : counterpart.translate("exchange.sell");
        let forceSellText = isBid ? counterpart.translate("exchange.buy") : counterpart.translate("exchange.sell");

        let noBalance = isPredictionMarket ? false : !(balanceAmount.getAmount() > 0 && hasBalance);
        //let invalidPrice = !(price > 0.00000006); // TODO needs to be done in API, but prevents low price market matching exploit in GUI
        let invalidPrice = !(price > 0);
        let invalidAmount = !(amount > 0.00000001);


        if (total && total > 0) {
            invalidAmount = !(total > 0.00000002);
        }
        //console.log('invalidamount= ' + invalidAmount + ' ' + f);

        let disabled = noBalance || invalidPrice || invalidAmount;

        let buttonClass = classNames("button buySellButton", type, {disabled: disabled});
        let balanceSymbol = isBid ? base.get("symbol") : quote.get("symbol");

        let disabledText = invalidPrice ? counterpart.translate("exchange.invalid_price") :
                           invalidAmount ? counterpart.translate("exchange.invalid_amount") :
                           noBalance ? counterpart.translate("exchange.no_balance") :
                           null;

        // Fee asset selection


        if( feeAssets[1] && feeAssets[1].getIn(["options", "core_exchange_rate", "quote", "asset_id"]) === "1.3.0" && feeAssets[1].getIn(["options", "core_exchange_rate", "base", "asset_id"]) === "1.3.0" ) {
            feeAsset = feeAssets[0];
            feeAssets.splice(1, 1);
        }



        let index = 0;
        let options = feeAssets.map(asset => {
            let {name, prefix} = utils.replaceName(asset.get("symbol").replace('BRIDGE.', ''), asset.get("bitasset") && !asset.getIn(["bitasset", "is_prediction_market"]) && asset.get("issuer") === "1.2.0");
            return <option key={asset.get("id")} value={index++}>{prefix}{name}</option>;
        });


        // Subtract fee from amount to sell
        let balanceToAdd;

        if (feeAsset.get("symbol") === balanceSymbol) {
            balanceToAdd = balanceAmount.clone(balanceAmount.getAmount() - fee.getAmount());
        } else {
            balanceToAdd = balanceAmount;
        }

        let {name, prefix} = utils.replaceName(this.props[isBid ? "base" : "quote"].get("symbol"), !!this.props[isBid ? "base" : "quote"].get("bitasset"));
        let buyBorrowDepositName = (prefix ? prefix : "") + name;
        if (price > 0 && price.toString().indexOf('e') !== -1) {
            price = Number(price).toFixed(8);
        }

        return (
            <div className={this.props.className}>
                <div className="exchange-bordered buy-sell-container">
                    <div className={"exchange-content-header " + type}>
                        <span>{buttonText} <AssetName dataPlace="top" name={quote.get("symbol")} /></span>
                        {this.props.onFlip ? <span onClick={this.props.onFlip} style={{cursor: "pointer", fontSize: "1rem"}}>  &#8646;</span> : null}
                        {this.props.onTogglePosition ? <span onClick={this.props.onTogglePosition} style={{cursor: "pointer", fontSize: "1rem"}}>  &#8645;</span> : null}
                        {<div onClick={this.props.onToggleOpen} className="float-right clickable hide-for-xlarge" style={{paddingLeft: 10}}>{caret}</div>}

                        {this.props.backedCoin ? <div className="float-right buy-sell-deposit"><a onClick={this._onDeposit.bind(this)}><Translate content="modal.deposit.submit" /> <span className="asset-name">{buyBorrowDepositName}</span></a></div> : null}
                        {this.props.onBorrow ? <div className="float-right buy-sell-deposit"><a onClick={this.props.onBorrow}><Translate content="exchange.borrow" />&nbsp;<span className="asset-name">{buyBorrowDepositName}</span></a></div> : null}


                    </div>

                    <form className={(!this.props.isOpen ? "hide-container " : "") + "order-form"} noValidate>
                        <div className="grid-block vertical no-overflow no-padding">

                                <div className="grid-block no-padding buy-sell-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="exchange.price" />:
                                    </div>
                                    <div className="grid-block small-5 no-margin no-overflow buy-sell-input">
                                        <ExchangeInput id="buyPrice" value={price} onChange={priceChange} autoComplete="off" placeholder="0.0" />
                                    </div>
                                    <div className="grid-block small-4 no-margin no-overflow buy-sell-box">
                                        <AssetName dataPlace="right" name={base.get("symbol")} />
                                        &nbsp;/&nbsp;
                                        <AssetName dataPlace="right" name={quote.get("symbol")} />
                                    </div>
                                </div>

                                <div className="grid-block no-padding buy-sell-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="transfer.amount" />:
                                    </div>
                                    <div className="grid-block small-5 no-margin no-overflow buy-sell-input">
                                        <ExchangeInput id="buyAmount" value={amount} onChange={amountChange} autoComplete="off" placeholder="0.0"/>
                                    </div>
                                    <div className="grid-block small-4 no-margin no-overflow buy-sell-box">
                                        <AssetName dataPlace="right" name={quote.get("symbol")} />
                                    </div>
                                </div>

                                <div className="grid-block buy-sell-row bottom-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="exchange.total" />:
                                    </div>
                                    <div className="grid-block small-5 no-margin no-overflow buy-sell-input">
                                        <ExchangeInput id="buyAmount" value={total} onChange={totalChange} autoComplete="off" placeholder="0.0"/>
                                    </div>
                                    <div className="grid-block small-4 no-margin no-overflow buy-sell-box">
                                        <AssetName dataPlace="right" name={base.get("symbol")} />
                                    </div>
                                </div>

                                <div className="grid-block no-padding buy-sell-row">
                                    <div className="grid-block small-3 no-margin no-overflow buy-sell-label">
                                        <Translate content="transfer.fee" />:
                                    </div>
                                    <div className="grid-block small-5 no-margin no-overflow buy-sell-input">
                                        <input className={!hasFeeBalance && showFeeAmount && realBalanceAmount > 0 ? "no-balance" : ""} disabled type="text" id="fee" value={!hasFeeBalance && showFeeAmount && realBalanceAmount > 0 ? counterpart.translate("transfer.errors.insufficient") : showFeeAmount ? fee.getAmount({real: true}) : 0} autoComplete="off"/>
                                    </div>

                                    <div className="grid-block small-4 no-margin no-overflow buy-sell-box" style={{paddingLeft: feeAssets.length !== 1 ? 0 : 5}}>
                                        <select
                                            style={feeAssets.length === 1 ? {background: "none"} : null}
                                            disabled={feeAssets.length === 1}
                                            value={feeAssets.indexOf(this.props.feeAsset)}
                                            className={"form-control" + (feeAssets.length !== 1 ? " buysell-select" : "")}
                                            onChange={this.props.onChangeFeeAsset}
                                        >
                                            {options}
                                        </select>
                                    </div>
                                </div>

                                {marketFee}
                            </div>
                            <div>
                                <div className="grid-content clear-fix no-padding">

                                    <table className="float-left">
                                        <tbody>
                                          <tr className="buy-sell-info">
                                                <td><Translate content="exchange.balance" />:</td>
                                                <td style={{paddingLeft: 5, textAlign: "right"}}>
                                                    <span style={{borderBottom: "#A09F9F 1px dotted", cursor: "pointer"}} onClick={this._addBalance.bind(this, balanceToAdd)}>
                                                        {utils.format_number(balanceAmount.getAmount({real: true}), balancePrecision)} <AssetName name={balanceSymbol} />
                                                    </span>
                                                </td>
                                          </tr>

                                          <tr className="buy-sell-info">
                                                <td style={{paddingTop: 5}}>{isBid ? <Translate content="exchange.lowest_ask" /> : <Translate content="exchange.highest_bid" />}:&nbsp;</td>
                                                {currentPrice ? (
                                                <td style={{paddingLeft: 5, textAlign: "right", paddingTop: 5, verticalAlign: "bottom"}}>
                                                    <span style={{borderBottom: "#A09F9F 1px dotted", cursor: "pointer"}} onClick={this.props.setPrice.bind(this, type, currentPriceObject.sellPrice())}>
                                                    <PriceText price={currentPrice} quote={quote} base={base} /> <AssetName name={base.get("symbol")} />/<AssetName name={quote.get("symbol")} />
                                                    </span>
                                                </td>) : null}
                                        </tr>
                                        </tbody>
                                    </table>

                                    {/* BUY/SELL button */}
                                    {disabledText ?
                                        (<div className="float-right" data-tip={disabledText} data-place="right">
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, true)} value={buttonText} />
                                        </div>) :
                                        (<div className="float-right" data-tip={""}>
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, true)} value={buttonText} />
                                        </div>)
                                    }

                                {/* SHORT button */}
                                    {disabledText && isPredictionMarket ? (
                                        <div style={{paddingRight: 10}} className="float-right" data-tip={disabledText} data-place="right">
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, false)} value={forceSellText} />
                                        </div>) : isPredictionMarket ? (
                                        <div style={{paddingRight: 10}} className="float-right" data-tip={""}>
                                            <input style={{margin: 0}} className={buttonClass} type="submit" onClick={onSubmit.bind(this, false)} value={forceSellText} />
                                        </div>) : null
                                    }

                                  </div>
                            </div>

                    </form>
                </div>
                <SimpleDepositWithdraw
                    ref="deposit_modal"
                    action="deposit"
                    fiatModal={false}
                    account={this.props.currentAccount.get("name")}
                    sender={this.props.currentAccount.get("id")}
                    asset={this.props[isBid ? "base" : "quote"].get("id")}
                    modalId={"simple_deposit_modal" + (type === "bid" ? "" : "_ask")}
                    balances={[this.props.balance]}
                    {...backedCoin}
                />

                {/* Bridge modal */}
                <SimpleDepositBlocktradesBridge
                    ref="bridge_modal"
                    action="deposit"
                    account={this.props.currentAccount.get("name")}
                    sender={this.props.currentAccount.get("id")}
                    asset={this.props.balanceId}
                    modalId={"simple_bridge_modal" + (type === "bid" ? "" : "_ask")}
                    balances={[this.props.balance]}
                    bridges={this.props.currentBridges}
                />
            </div>
        );
    }
}

export default BindToChainState(BuySell, {keep_updating: true});
