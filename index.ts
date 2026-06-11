import { db, PERM, Handler, Context, Types, param } from 'hydrooj';

const coll = db.collection('frosted_glass');

export const name = 'frosted-glass';

interface GlassConfig {
  enabled: boolean;
  opacity: number;
  blur: number;
}

async function getConfig(domainId: string): Promise<GlassConfig> {
  const data = await coll.findOne({ domainId });
  return {
    enabled: data?.enabled ?? false,
    opacity: data?.opacity ?? 0.35,
    blur: data?.blur ?? 24,
  };
}

async function setConfig(domainId: string, config: GlassConfig) {
  await coll.updateOne(
    { domainId },
    { $set: config },
    { upsert: true },
  );
}

class DomainGlassConfigHandler extends Handler {
  async prepare({ domainId }) {
    this.checkPerm(PERM.PERM_EDIT_DOMAIN);
    this.domain = domainId;
  }

  async get() {
    const config = await getConfig(this.domain);
    this.response.template = 'domain_frosted_glass.html';
    this.response.body = {
      domainId: this.domain,
      ...config,
    };
  }

  @param('enabled', Types.Boolean)
  @param('opacity', Types.Float)
  @param('blur', Types.Int)
  async post(domainId: string, enabled: boolean, opacity: number, blur: number) {
    await setConfig(domainId, { enabled, opacity, blur });
    this.response.redirect = this.url('domain_frosted_glass', { domainId });
  }
}

class GlassConfigHandler extends Handler {
  async get() {
    const domainId = this.request.query.domainId as string;
    if (!domainId) {
      this.response.body = {};
      this.response.template = null;
      return;
    }
    const config = await getConfig(domainId);
    this.response.body = config;
    this.response.template = null;
  }
}

export async function apply(ctx: Context) {
  ctx.injectUI('DomainManage', 'domain_frosted_glass', { family: 'Properties', icon: 'brush' });
  ctx.Route('domain_frosted_glass', '/domain/frosted-glass', DomainGlassConfigHandler);
  ctx.Route('frosted_glass_config', '/frosted-glass/config', GlassConfigHandler);

  ctx.i18n.load('zh', {
    domain_frosted_glass: '毛玻璃画布',
    frosted_glass_enabled: '启用毛玻璃',
    frosted_glass_opacity: '画布透明度',
    frosted_glass_blur: '模糊强度 (px)',
    frosted_glass_save: '保存设置',
  });
  ctx.i18n.load('en', {
    domain_frosted_glass: 'Frosted Glass',
    frosted_glass_enabled: 'Enable Frosted Glass',
    frosted_glass_opacity: 'Canvas Opacity',
    frosted_glass_blur: 'Blur Strength (px)',
    frosted_glass_save: 'Save Settings',
  });

}
