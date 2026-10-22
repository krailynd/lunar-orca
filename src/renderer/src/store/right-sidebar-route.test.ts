import { describe, expect, it } from 'vitest'
import { normalizeRightSidebarRoute } from './right-sidebar-route'

describe('normalizeRightSidebarRoute', () => {
  it.each([
    'explorer',
    'vault',
    'todos',
    'workspaces',
    'pr-checks',
    'source-control',
    'checks',
    'ports'
  ])('preserves the %s tab', (tab) => {
    expect(normalizeRightSidebarRoute(tab)).toEqual({
      rightSidebarTab: tab,
      rightSidebarExplorerView: 'files'
    })
  })

  it('still normalizes invalid tabs to Explorer files', () => {
    expect(normalizeRightSidebarRoute('missing')).toEqual({
      rightSidebarTab: 'explorer',
      rightSidebarExplorerView: 'files'
    })
  })

  it('preserves well-formed plugin panel tabs', () => {
    expect(normalizeRightSidebarRoute('plugin:orca-samples.my-plugin/dashboard')).toEqual({
      rightSidebarTab: 'plugin:orca-samples.my-plugin/dashboard',
      rightSidebarExplorerView: 'files'
    })
  })

  it('drops a well-formed tab once the installed plugin list proves it is stale', () => {
    expect(
      normalizeRightSidebarRoute('plugin:orca-samples.removed/dashboard', undefined, {
        installedPluginTabKeys: new Set(['plugin:orca-samples.present/dashboard'])
      })
    ).toEqual({
      rightSidebarTab: 'explorer',
      rightSidebarExplorerView: 'files'
    })
  })

  it('normalizes malformed plugin tabs to Explorer files', () => {
    expect(normalizeRightSidebarRoute('plugin:orca-samples.my-plugin')).toEqual({
      rightSidebarTab: 'explorer',
      rightSidebarExplorerView: 'files'
    })
    expect(normalizeRightSidebarRoute('plugin:orca-samples.my-plugin/panel/extra')).toEqual({
      rightSidebarTab: 'explorer',
      rightSidebarExplorerView: 'files'
    })
    expect(normalizeRightSidebarRoute('plugin:My_Plugin/Panel!')).toEqual({
      rightSidebarTab: 'explorer',
      rightSidebarExplorerView: 'files'
    })
  })
})
