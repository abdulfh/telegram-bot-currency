// Dependencies
const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");

// Init
const token = 'TELEGRAM_TOKEN';
const bot = new Telegraf(token);

// Includes
const Converter = require("./api/currency_converter");

bot.start((ctx) => 
    ctx.reply(`How I Can Help You, ${ctx.from.first_name} ?`,
        Markup.inlineKeyboard([
            Markup.callbackButton("Convert Currency", "CONVERT_CURRENCY"),
            Markup.callbackButton("View Rates", "VIEW_RATES")
        ]).extra()
    )
);

// Go back to menu after action
bot.action("BACK", ctx => {
    ctx.reply(`Glad I could help`);
    ctx.reply(
      `Do you need something else, ${ctx.from.first_name}?`,
      Markup.inlineKeyboard([
        Markup.callbackButton("💱 Convert Currency", "CONVERT_CURRENCY"),
        Markup.callbackButton("🤑 View Rates", "VIEW_RATES")
      ]).extra()
    );
  });

// Currency converter Wizard
const currencyConverter = new WizardScene(
    "currency_converter",
    ctx => {
      ctx.reply("Please, type in the currency to convert from (example: USD)");
      return ctx.wizard.next();
    },
    ctx => {
      /* 
      * ctx.wizard.state is the state management object which is persistent
      * throughout the wizard 
      * we pass to it the previous user reply (supposed to be the source Currency ) 
      * which is retrieved through `ctx.message.text`
      */
      ctx.wizard.state.currencySource = ctx.message.text;
      ctx.reply(
        `Got it, you wish to convert from ${
          ctx.wizard.state.currencySource
        } to what currency? (example: EUR)`
      );
      // Go to the following scene
      return ctx.wizard.next();
    },
    ctx => {
      /*
      * we get currency to convert to from the last user's input
      * which is retrieved through `ctx.message.text`
      */
      ctx.wizard.state.currencyDestination = ctx.message.text;
      ctx.reply(
        `Enter the amount to convert from ${ctx.wizard.state.currencySource} to ${
          ctx.wizard.state.currencyDestination
        }`
      );
      return ctx.wizard.next();
    },
    ctx => {
      const amt = (ctx.wizard.state.amount = ctx.message.text);
      const source = ctx.wizard.state.currencySource;
      const dest = ctx.wizard.state.currencyDestination;
      const rates = Converter.getRate(source, dest);
      rates.then(res => {
        let newAmount = Object.values(res.data)[0] * amt;
        newAmount = newAmount.toFixed(3).toString();
        ctx.reply(
          `${amt} ${source} is worth \n${newAmount} ${dest}`,
          Markup.inlineKeyboard([
            Markup.callbackButton("🔙 Back to Menu", "BACK"),
            Markup.callbackButton(
              "💱 Convert Another Currency",
              "CONVERT_CURRENCY"
            )
          ]).extra()
        );
      });
      return ctx.scene.leave();
    }
);
  
// Scene registration
const stage = new Stage([currencyConverter], { default: "currency_converter" });
bot.use(session());
bot.use(stage.middleware());
bot.startPolling();
