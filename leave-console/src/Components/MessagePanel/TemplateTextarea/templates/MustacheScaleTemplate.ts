/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Handlebars from 'handlebars'

// @ts-ignore `registerHelper` types are wrong
Handlebars.registerHelper('first', (...args) => {
  const firstValue = args.find(v => v !== undefined && v !== null)

  return new Handlebars.SafeString(firstValue)
})

class MustacheScaleTemplate {
  private readonly template: Handlebars.TemplateDelegate<any>

  constructor(template: Handlebars.TemplateDelegate<any>) {
    this.template = template
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format(data: any) {
    return this.template(data)
  }
}

export function parse(source: string): MustacheScaleTemplate {
  const template = Handlebars.compile(source)
  return new MustacheScaleTemplate(template)
}
